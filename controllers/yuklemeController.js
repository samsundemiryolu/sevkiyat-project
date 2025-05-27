const fs = require("fs");
const path = require("path");
const { paths, baseUrl } = require("../config");

// JSON dosyalarını oku
function loadChecklist() {
  const filePath = paths.checklists;
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  return content ? JSON.parse(content) : [];
}

function loadFirms() {
  const filePath = paths.firms;
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  return content ? JSON.parse(content) : [];
}

function loadShips() {
  const filePath = paths.ships;
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  return content ? JSON.parse(content) : [];
}

function enrichChecklist(checklist, ships) {
  return checklist.map(item => {
    const ship = ships.find(s => s.summaryNumber === item.shipId);
    return {
      ...item,
      shipName: ship ? ship.name : "Bilinmiyor"
    };
  });
}
exports.removeChecklistItem = (req, res) => {
  try {
    const { shipId, firmaId, subFirmId, parti, ebat, net, brut } = req.body;
    const filePath = paths.checklists;

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Checklist bulunamadı." });

    let data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    data = data.filter(r =>
      !(
        r.shipId    === shipId &&
        r.firmaId   === firmaId &&
        r.subFirmId === subFirmId &&
        r.parti     === parti &&
        r.ebat      === ebat &&
        parseFloat(r.net)  === parseFloat(net) &&
        parseFloat(r.brut) === parseFloat(brut)
      )
    );

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

    res.json({ success: true });
  } catch (err) {
    console.error("Silme hatası:", err);
    res.status(500).json({ error: "İşlem sırasında hata oluştu." });
  }
};
// controllers/yuklemeController.js

exports.restoreChecklistItem = (req, res) => {
  console.log("🔔 RESTORE isteği alındı:", req.body);
  try {
    const newItem  = req.body;
    const filePath = paths.checklists;

    let data = [];
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    // Her seferinde ekle
    data.push(newItem);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

    console.log("✅ Dosyaya eklendi, toplam kayıt sayısı:", data.length);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Geri alma hatası:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Sayfayı render et
exports.showYuklemeList = (req, res) => {
  const checklistData = loadChecklist();
  const firmData = loadFirms();
  const shipData = loadShips();

  const enrichedData = checklistData.map(item => {
    const firm = firmData.find(f => f.id === item.firmaId);
    const ship = shipData.find(s => s.summaryNumber === item.shipId);

    let subFirmName = item.subFirmId;
    if (firm && firm.subunits) {
      const match = firm.subunits.find(name => item.subFirmId.endsWith(name));
      subFirmName = match || item.subFirmId;
    }

    return {
      ...item,
      firmName: firm ? firm.name : "(Tanımsız Firma)",
      shipFull: ship ? `${item.shipId} - ${ship.name}` : item.shipId,
      subFirmName: subFirmName
    };
  });

res.render("yuklemeList", {
  baseUrl: "",             // ✅ kalsın
  checklist: checklistData // ✅ enrich olmadan ham veri gönder
});
};
