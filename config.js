const path = require('path');

const dataDirectory = path.join(__dirname, "data"); // HER ZAMAN bu olacak

module.exports = {
  baseUrl: process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://sevkiyat-project.up.railway.app",
  dataPath: dataDirectory,
  paths: {
    ships:     path.join(dataDirectory, "ships.json"),
    firms:     path.join(dataDirectory, "firms.json"),
    checklists:path.join(dataDirectory, "checklists.json"),
    shipment:  path.join(dataDirectory, "shipment.json"),
    vehicles:  path.join(dataDirectory, "vehicles.json"),
    erbosan:   path.join(dataDirectory, "erbosan.json"),
  }
};
