// controllers/sevkiyatController.js
const fs = require("fs");
const { paths, baseUrl } = require("../config");
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

// Form sayfasını göster
exports.showSevkiyatForm = (req, res) => {
  res.render("sevkiyatForm", { baseUrl });
};

// Formdan gelen veriyi JSON'a kaydet
exports.saveShipment = (req, res) => {
  try {
    const shipments = loadShipments();
    const newId = Date.now().toString();

    const payload = {
      ...req.body,
      id: newId,
      timestamp: new Date().toISOString()
    };

    shipments.push(payload);
    saveShipments(shipments);

    res.json({ success: true, id: newId });
  } catch (err) {
    console.error("Kayıt hatası:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Kayıtları listele (opsiyonel)
exports.getShipments = (req, res) => {
  const data = loadShipments();
  res.json(data);
};
