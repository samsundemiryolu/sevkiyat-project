// controllers/sevkController.js
const fs = require("fs");
const { paths, baseUrl } = require("../config");   // ← paths eklendi
const path = require("path");

function loadShipments() {
  const filePath = paths.shipments;
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  return content ? JSON.parse(content) : [];
}

function saveShipments(data) {
  fs.writeFileSync(paths.shipments, JSON.stringify(data, null, 2), "utf-8");
}

// GET /sevk → sayfa render
exports.getSevkIslemleri = (req, res) => {
  res.render("sevkIslemleri", { baseUrl });        // ← artık gerçek baseUrl geçiyoruz
};

// GET /sevk/shipments → JSON
exports.getShipments = (req, res) => {
  try {
    const data = loadShipments();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Veriler okunamadı." });
  }
};

// POST /sevk/updateStatus
exports.updateStatus = (req, res) => {
  try {
    const { id, yeniDurum, tarih } = req.body;
    const shipments = loadShipments();
    const sh = shipments.find(s => s.id === id);
    if (!sh) return res.status(404).json({ error: "Kayıt bulunamadı." });

    sh.status = sh.status || {};
    sh.status.sevkDurumu  = yeniDurum;
    sh.status.durumTarihi = tarih;
    saveShipments(shipments);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Güncelleme hatası." });
  }
};

// POST /sevk/updatePayment
exports.updatePayment = (req, res) => {
  try {
    const { id, odemeDurumu, odemeTarihi } = req.body;
    const shipments = loadShipments();
    const sh = shipments.find(s => s.id === id);
    if (!sh) return res.status(404).json({ error: "Kayıt bulunamadı." });

    sh.payment = sh.payment || {};
    sh.payment.odemeDurumu  = odemeDurumu;
    sh.payment.odemeTarihi  = odemeTarihi;
    saveShipments(shipments);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Ödeme güncelleme hatası." });
  }
};
