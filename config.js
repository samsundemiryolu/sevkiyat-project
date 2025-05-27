const path = require('path');
const isLocal = process.env.NODE_ENV !== "production";

// Ortak JSON dizini
const dataDirectory = "C:/projeler/sevkiyat-data";

module.exports = {
  baseUrl: isLocal
    ? "http://localhost:3000"
    : "https://samsunlojistikmerkezi.com.tr",
  dataPath: dataDirectory,

  // JSON dosyalarının tam yolları:
  paths: {
    ships:      path.join(dataDirectory, "ships.json"),
    firms:      path.join(dataDirectory, "firms.json"),
    checklists: path.join(dataDirectory, "checklists.json"),
    shipment:   path.join(dataDirectory, "shipment.json"),
    vehicles:   path.join(dataDirectory, "vehicles.json"),
    erbosan:    path.join(dataDirectory, "erbosan.json")
    // gerektiğinde diğer dosyaları buraya ekleyebilirsiniz
  }
};
