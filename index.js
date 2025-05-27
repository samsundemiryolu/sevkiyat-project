// index.js (ilgili kısımlar)
const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// ====================================
// Çalışan, Proje, Attendance JSON dosyaları
// ====================================
let employees = [];
let projects = [];
let attendanceRecords = [];

function loadData() {
  // employees
  if (fs.existsSync("employees.json")) {
    employees = JSON.parse(fs.readFileSync("employees.json", "utf8"));
  }
  // projects
  if (fs.existsSync("projects.json")) {
    projects = JSON.parse(fs.readFileSync("projects.json", "utf8"));
  }
  // attendance
  if (fs.existsSync("attendance.json")) {
    attendanceRecords = JSON.parse(fs.readFileSync("attendance.json", "utf8"));
  }
}

function saveEmployees() {
  fs.writeFileSync("employees.json", JSON.stringify(employees, null, 2));
}
function saveProjects() {
  fs.writeFileSync("projects.json", JSON.stringify(projects, null, 2));
}
function saveAttendance() {
  fs.writeFileSync("attendance.json", JSON.stringify(attendanceRecords, null, 2));
}

loadData();

// ====================================
// Durum hesaplama fonksiyonu (SGK/İSG/EK2)
// ====================================
function computeStatuses(employeesArr) {
  const currentDate = new Date();
  return employeesArr.map(emp => {
    let sgkStatus = "yok";
    let isgStatus = "yok";
    let ek2Status = "yok";

    // SGK var: giriş tarihi var ve çıkış tarihi yoksa
    if (emp.sgkEntryDate && (!emp.sgkExitDate || emp.sgkExitDate.trim() === "")) {
      sgkStatus = "var";
    }
    // isg var: bitiş >= bugün
    if (emp.isgEndDate && new Date(emp.isgEndDate) >= currentDate) {
      isgStatus = "var";
    }
    // ek2 var: bitiş >= bugün
    if (emp.ek2EndDate && new Date(emp.ek2EndDate) >= currentDate) {
      ek2Status = "var";
    }
    return { ...emp, sgkStatus, isgStatus, ek2Status };
  });
}


// GENEL ANA SAYFA (home.ejs)
app.get("/", (req, res) => {
  res.render("home", { message: "" });
});

// AYRINTILI PUANTAJ ANA SAYFASI (index.ejs)
app.get("/index", (req, res) => {
  const currentDate = new Date();

  const ongoingProjects = projects.filter(proj => !proj.endDate || proj.endDate.trim() === "");

  const expiredEmployees = employees.filter(emp => {
    let expiredDocs = [];
    if (emp.isgEndDate && new Date(emp.isgEndDate) < currentDate) expiredDocs.push("ISG");
    if (emp.ek2EndDate && new Date(emp.ek2EndDate) < currentDate) expiredDocs.push("EK2");
    if (emp.gbtEndDate && new Date(emp.gbtEndDate) < currentDate) expiredDocs.push("GBT");
    if (expiredDocs.length > 0) {
      emp.expiredDocs = expiredDocs.join(", ");
      return true;
    }
    return false;
  });

  res.render("index", {
    ongoingProjects,
    expiredEmployees,
    message: ""
  });
});


// ====================================
// Çalışanlar
// ====================================
app.get("/employees", (req, res) => {
  const employeesWithStatus = computeStatuses(employees);
  res.render("employees", { employees: employeesWithStatus, message: "", error: "" });
});

// Filtre (AJAX)
app.get("/employees/filter", (req, res) => {
  const { searchName, searchTc, sgkStatus, isgStatus, ek2Status } = req.query;
  let employeesWithStatus = computeStatuses(employees);
  const filtered = employeesWithStatus.filter(emp => {
    let match = true;
    if (searchName) {
      const lowerName = searchName.toLowerCase();
      const fullName = (emp.name + " " + emp.surname).toLowerCase();
      if (!fullName.includes(lowerName)) match = false;
    }
    if (searchTc) {
      if (!emp.tcNumber.includes(searchTc)) match = false;
    }
    if (sgkStatus && sgkStatus !== emp.sgkStatus) match = false;
    if (isgStatus && isgStatus !== emp.isgStatus) match = false;
    if (ek2Status && ek2Status !== emp.ek2Status) match = false;
    return match;
  });
  res.json(filtered);
});

// Yeni çalışan kaydı
app.post("/employees", async (req, res) => {
  try {
    const {
      name, surname, tcNumber, birthDate, phone,
      sgkEntryDate, sgkExitDate,
      isgStartDate, isgEndDate,
      ek2StartDate, ek2EndDate,
      gbtStartDate, gbtEndDate
    } = req.body;

    // Zorunlu alanlar
    if (!name || !surname || !tcNumber || !birthDate || !phone ||
        !isgStartDate || !isgEndDate || !ek2StartDate || !ek2EndDate) {
      return res.json({ success: false, message: "Zorunlu alanları doldurunuz!" });
    }
    if (!/^\d{11}$/.test(tcNumber)) {
      return res.json({ success: false, message: "TC Kimlik Numarası 11 rakam olmalı!" });
    }
    if (!/^\d{11}$/.test(phone)) {
      return res.json({ success: false, message: "İletişim numarası 11 rakam olmalı!" });
    }
    // Benzersiz TC
    if (employees.find(emp => emp.tcNumber === tcNumber)) {
      return res.json({ success: false, message: "Bu TC Kimlik numarasıyla kayıt zaten mevcut!" });
    }
    // SGK PDF kontrolü
    if (sgkEntryDate && (!sgkExitDate || sgkExitDate.trim() === "")) {
      if (!req.files || !req.files.pdf) {
        return res.json({ success: false, message: "SGK giriş tarihi girildiyse ve çıkış tarihi boşsa, PDF bildirgesi yükleyiniz!" });
      }
      const data = await pdfParse(req.files.pdf.data);
      const pdfDigits = data.text.replace(/\D/g, "");
      if (!pdfDigits.includes(tcNumber)) {
        return res.json({ success: false, message: "TC Kimlik numarası PDF içinde bulunamadı!" });
      }
    }

    const newEmployee = {
      name, surname, tcNumber, birthDate, phone,
      sgkEntryDate, sgkExitDate,
      isgStartDate, isgEndDate,
      ek2StartDate, ek2EndDate,
      gbtStartDate, gbtEndDate
    };
    employees.push(newEmployee);
    saveEmployees();
    return res.json({ success: true, message: "Çalışan kaydı başarıyla tamamlandı!" });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Sunucu hatası: " + err.message });
  }
});

// Çalışan düzenleme sayfası
app.get("/employees/:tc/edit", (req, res) => {
  const tc = req.params.tc;
  const employee = employees.find(emp => emp.tcNumber === tc);
  if (!employee) {
    return res.redirect("/employees?error=Çalışan bulunamadı!");
  }
  res.render("employeeEdit", { employee, message: "", error: "" });
});

// Çalışan düzenleme işlemi
app.post("/employees/:tc/edit", async (req, res) => {
  try {
    const tc = req.params.tc;
    const employee = employees.find(emp => emp.tcNumber === tc);
    if (!employee) {
      return res.redirect("/employees?error=Çalışan bulunamadı!");
    }
    const {
      phone, sgkEntryDate, sgkExitDate,
      isgStartDate, isgEndDate,
      ek2StartDate, ek2EndDate,
      gbtStartDate, gbtEndDate
    } = req.body;

    if (!phone || !isgStartDate || !isgEndDate || !ek2StartDate || !ek2EndDate) {
      return res.render("employeeEdit", { employee, message: "", error: "Zorunlu alanları doldurunuz!" });
    }
    if (!/^\d{11}$/.test(phone)) {
      return res.render("employeeEdit", { employee, message: "", error: "İletişim numarası 11 rakam olmalı!" });
    }
    if (sgkEntryDate && (!sgkExitDate || sgkExitDate.trim() === "")) {
      if (!req.files || !req.files.pdf) {
        return res.render("employeeEdit", { employee, message: "", error: "SGK giriş tarihi girildiyse ve çıkış tarihi boşsa, PDF bildirgesi yükleyiniz!" });
      }
      const data = await pdfParse(req.files.pdf.data);
      const pdfDigits = data.text.replace(/\D/g, "");
      if (!pdfDigits.includes(employee.tcNumber)) {
        return res.render("employeeEdit", { employee, message: "", error: "TC Kimlik numarası PDF içinde bulunamadı!" });
      }
    }

    // Güncelle
    employee.phone = phone;
    employee.sgkEntryDate = sgkEntryDate;
    employee.sgkExitDate = sgkExitDate;
    employee.isgStartDate = isgStartDate;
    employee.isgEndDate = isgEndDate;
    employee.ek2StartDate = ek2StartDate;
    employee.ek2EndDate = ek2EndDate;
    employee.gbtStartDate = gbtStartDate;
    employee.gbtEndDate = gbtEndDate;

    saveEmployees();
    return res.render("employeeEdit", { employee, message: "Çalışan kaydı başarıyla güncellendi!", error: "" });
  } catch (err) {
    console.error(err);
    return res.render("employeeEdit", { employee: req.body, message: "", error: "Sunucu hatası: " + err.message });
  }
});

// ====================================
// Projeler
// ====================================
app.get("/projects", (req, res) => {
  res.render("projectList", { projects, error: "", message: "" });
});

// Yeni proje formu
app.get("/projects/new", (req, res) => {
  res.render("projectForm", { project: {}, error: "", message: "" });
});

// Yeni proje kaydı
app.post("/projects", (req, res) => {
  const { projectName, projectType, startDate, endDate } = req.body;
  if (!projectName || !startDate) {
    return res.render("projectForm", { project: req.body, error: "Proje adı ve başlangıç tarihi zorunludur!", message: "" });
  }
  if (projects.find(p => p.projectName === projectName)) {
    return res.render("projectForm", { project: req.body, error: "Bu proje adıyla kayıt zaten mevcut!", message: "" });
  }
  const newProject = { projectName, projectType, startDate, endDate: endDate || "" };
  projects.push(newProject);
  saveProjects();
  res.redirect("/projects");
});

// Proje düzenleme formu
app.get("/projects/:projectName/edit", (req, res) => {
  const projectName = req.params.projectName;
  const project = projects.find(p => p.projectName === projectName);
  if (!project) {
    return res.redirect("/projects?error=Proje bulunamadı!");
  }
  res.render("projectForm", { project, error: "", message: "" });
});

// Proje düzenleme işlemi
app.post("/projects/:projectName/edit", (req, res) => {
  const projectName = req.params.projectName;
  const project = projects.find(p => p.projectName === projectName);
  if (!project) {
    return res.redirect("/projects?error=Proje bulunamadı!");
  }
  const { projectType, startDate, endDate } = req.body;
  if (!startDate || !endDate) {
    return res.render("projectForm", {
      project: { ...project, ...req.body },
      error: "Başlangıç ve bitiş tarihleri zorunludur!",
      message: ""
    });
  }
  project.projectType = projectType;
  project.startDate = startDate;
  project.endDate = endDate;
  saveProjects();
  res.render("projectForm", { project, error: "", message: "Proje başarıyla güncellendi!" });
});

// ===========================
// Puantaj Girişleri Sayfası (Attendance)
// ===========================
app.get("/attendance", (req, res) => {
  // Projeler ve çalışanlar verileri form dropdown'ları için gönderiliyor
  res.render("attendance", { projects, employees });
});

// Kaydet (POST) -> /attendance/save
app.post("/attendance/save", (req, res) => {
  try {
    const { year, month, project, employee, days } = req.body;
    if (!project || !employee) {
      return res.json({ success: false, message: "Proje ve Çalışan zorunludur!" });
    }
    // ID oluştur
    const recordId = Date.now().toString();
    // days -> [{day:1,workCount:2}, ...]
    // Basit şekilde saklıyoruz
    const newRecord = {
      id: recordId,
      year: parseInt(year),
      month: parseInt(month),
      project,
      employee,
      days,
    };
    attendanceRecords.push(newRecord);
    saveAttendance();
    return res.json({ success: true });
  } catch (err) {
    console.error("attendance/save error:", err);
    return res.json({ success: false, message: err.message });
  }
});
// ====================================
// Puantaj Raporları
// ====================================
app.get("/attendance/reports", (req, res) => {
  res.render("attendanceReports", { projects, employees });
});

// Dinamik Rapor Verisi
app.get("/attendance/reports/data", (req, res) => {
  const { year, month, project, employeeSearch, startDate, endDate } = req.query;

  function monthName(m) {
    const arr = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    return arr[m] || "";
  }

  const employeeMap = {};
  employees.forEach(e => {
    employeeMap[e.tcNumber] = { fullName: `${e.name} ${e.surname}`, tc: e.tcNumber };
  });

  let filtered = attendanceRecords.slice();
  if (year) filtered = filtered.filter(r => r.year == year);
  if (month) filtered = filtered.filter(r => r.month == month);
  if (project) filtered = filtered.filter(r => r.project === project);
  if (employeeSearch && employeeSearch.trim() !== "") {
    const search = employeeSearch.toLowerCase();
    filtered = filtered.filter(r => {
      const emp = employeeMap[r.employee];
      return emp && (emp.fullName.toLowerCase().includes(search) || emp.tc.includes(search));
    });
  }
  if (startDate && endDate) {
    const from = new Date(startDate);
    const to = new Date(endDate);
    filtered = filtered.filter(r => {
      return r.days.some(d => {
        const fullDate = new Date(r.year, r.month, d.day);
        return fullDate >= from && fullDate <= to;
      });
    });
  }

  const result = filtered.map(r => {
    let total = 0;
    if (startDate && endDate) {
      const from = new Date(startDate);
      const to = new Date(endDate);
      total = r.days.filter(d => {
        const fullDate = new Date(r.year, r.month, d.day);
        return fullDate >= from && fullDate <= to;
      }).reduce((sum, d) => sum + (parseInt(d.workCount) || 0), 0);
    } else {
      total = r.days.reduce((sum, d) => sum + (parseInt(d.workCount) || 0), 0);
    }
    const emp = employeeMap[r.employee];
    return {
      id: r.id,
      year: r.year,
      month: r.month,
      monthName: monthName(r.month),
      project: r.project,
      employee: r.employee,
      employeeName: emp ? `${emp.fullName} (${emp.tc})` : r.employee,
      totalDays: total
    };
  });

  res.json(result);
});
// ====================================
// Puantaj Kaydı Açma
// ====================================
app.get("/attendance/entry", (req, res) => {
  // attendanceEntry.ejs
  res.render("attendanceEntry");
});

// JSON data -> /attendance/entry/data
app.get("/attendance/entry/data", (req, res) => {
  const { recordId } = req.query;
  const rec = attendanceRecords.find(x => x.id === recordId);
  if (!rec) {
    return res.json({ success: false, message: "Kayıt bulunamadı!" });
  }

  // readOnly = proje bitiş tarihi geçmişse veya çalışan sgk çıkışı varsa
  let readOnly = false;
  // Proje bitiş tarihi
  const proj = projects.find(p => p.projectName === rec.project);
  if (proj && proj.endDate) {
    const endD = new Date(proj.endDate);
    if (endD < new Date()) {
      readOnly = true;
    }
  }
  // Çalışan SGK çıkışı
  const emp = employees.find(e => e.tcNumber === rec.employee);
  if (emp && emp.sgkExitDate && emp.sgkExitDate.trim() !== "") {
    readOnly = true;
  }

  // Ay ismini ekleyelim
  function monthName(m) {
    const arr = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
    return arr[m] || "";
  }
  const recordWithName = {
    ...rec,
    monthName: monthName(rec.month),
    employeeName: emp ? (emp.name + " " + emp.surname) : rec.employee
  };

  res.json({ success: true, record: recordWithName, readOnly });
});

// POST /attendance/entry/save
app.post("/attendance/entry/save", (req, res) => {
  const { recordId, days } = req.body;
  const rec = attendanceRecords.find(x => x.id === recordId);
  if (!rec) {
    return res.json({ success: false, message: "Kayıt bulunamadı!" });
  }
  // readOnly kontrol
  let readOnly = false;
  const proj = projects.find(p => p.projectName === rec.project);
  if (proj && proj.endDate) {
    if (new Date(proj.endDate) < new Date()) {
      readOnly = true;
    }
  }
  const emp = employees.find(e => e.tcNumber === rec.employee);
  if (emp && emp.sgkExitDate && emp.sgkExitDate.trim() !== "") {
    readOnly = true;
  }
  if (readOnly) {
    return res.json({ success: false, message: "Kayıt salt okunur!" });
  }

  // Güncellemeyi uygula
  rec.days = days || [];
  saveAttendance();
  return res.json({ success: true });
});

// ====================================
// Firmalar (Firms) Modülü
// ====================================
app.get("/obs", (req, res) => {
  res.render("cargoScreen"); // veya hangi sayfayı açmasını istiyorsan
});

// Ship route'u ekle
const shipRoutes = require("./routes/shipRoutes");
app.use("/ships", shipRoutes);

const yuklemeRoutes = require("./routes/yuklemeRoutes");
app.use("/yukleme", yuklemeRoutes);

const vehicleRoutes = require("./routes/vehicleRoutes");
app.use("/vehicles", vehicleRoutes);

const sevkiyatRoutes = require("./routes/sevkiyatRoutes");
app.use("/sevkiyat", require("./routes/sevkiyatRoutes"));

const sevkRoutes = require("./routes/sevkRoutes");
app.use("/sevk", sevkRoutes);

const firmRoutes = require("./routes/firmRoutes");
app.use("/firms", firmRoutes);  // ✅ /api olmadan, direkt /firms

module.exports = {
  baseUrl: "http://localhost:3000" // veya dış IP/ngrok
};


// ====================================
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor: http://localhost:${PORT}`);
});