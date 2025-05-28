const path = require("path");

const dataDirectory = path.join(__dirname, "data");

module.exports = {
  baseUrl:
    process.env.BASE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://sevkiyat-project.up.railway.app"
      : "http://localhost:3000"),
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
