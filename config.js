const path = require('path');
const isLocal = process.env.NODE_ENV !== 'production';

// Ortak JSON dizini tanımı
const dataDirectory = isLocal
  ? path.join(__dirname, "data")           // Electron için
  : "/app/data";                           // Railway için

module.exports = {
  baseUrl: isLocal
    ? "http://localhost:3000"
    : "https://sevkiyat-project.up.railway.app",
  dataPath: dataDirectory,
  paths: {
    ships: path.join(dataDirectory, "ships.json"),
    firms: path.join(dataDirectory, "firms.json"),
    checklists: path.join(dataDirectory, "checklists.json"),
    shipment: path.join(dataDirectory, "shipment.json"),
    vehicles: path.join(dataDirectory, "vehicles.json"),
    erbosan: path.join(dataDirectory, "erbosan.json"),
    odeme: path.join(dataDirectory, "odeme.json")
  }
};
