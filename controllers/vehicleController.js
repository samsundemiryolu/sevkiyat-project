const fs = require("fs");
const { paths, baseUrl } = require("../config"); // JSON yolları ve baseUrl alınır
const vehicles = paths.vehicles; // vehicles.json dosyasının yolu

// JSON'dan oku
function loadVehicles() {
  if (!fs.existsSync(vehicles)) return [];
  const content = fs.readFileSync(vehicles, "utf-8");
  return content ? JSON.parse(content) : [];
}

// JSON'a yaz
function saveVehicles(data) {
  fs.writeFileSync(vehicles, JSON.stringify(data, null, 2), "utf-8");
}

// 🚗 Form Sayfasını Göster
exports.showVehicleForm = (req, res) => {
  res.render("vehicleForm", { baseUrl });
};

// 📋 Listele (JSON)
exports.getVehicles = (req, res) => {
  const list = loadVehicles();
  res.json(list);
};

// ➕ Yeni Araç Kaydet
exports.saveVehicle = (req, res) => {
  const list = loadVehicles();
  const { id, vehicleClass, vehicleType, minTon, maxTon } = req.body;

  if (list.find(v => v.id === id)) {
    return res.status(409).send("❌ Bu araç zaten kayıtlı.");
  }

  list.push({ id, vehicleClass, vehicleType, minTon, maxTon });
  saveVehicles(list);
  res.send("✅ Araç başarıyla kaydedildi.");
};
