const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { baseUrl, paths } = require("../config");
const firmsPath = paths.firms;

function readFirms() {
  try {
    return JSON.parse(fs.readFileSync(firmsPath, "utf8"));
  } catch (err) {
    return [];
  }
}

function writeFirms(data) {
  fs.writeFileSync(firmsPath, JSON.stringify(data, null, 2), "utf8");
}

exports.showFirmForm = (req, res) => {
  res.render("firmForm", { baseUrl });
};

exports.getFirms = (req, res) => {
  const firms = readFirms();
  res.json(firms);
};

exports.addFirm = (req, res) => {
  const firms = readFirms();
  const { name, subunits } = req.body;

  if (!name || !Array.isArray(subunits)) {
    return res.status(400).send("Geçersiz veri.");
  }

  firms.push({ id: uuidv4(), name, subunits });
  writeFirms(firms);
  res.send("Firma eklendi.");
};

exports.updateFirm = (req, res) => {
  const firms = readFirms();
  const { index } = req.params;
  const { name, subunits } = req.body;

  const i = firms.findIndex((f) => f.id === index);
  if (i === -1) return res.status(404).send("Firma bulunamadı.");

  firms[i] = { id: index, name, subunits };
  writeFirms(firms);
  res.send("Firma güncellendi.");
};

exports.deleteFirm = (req, res) => {
  const firms = readFirms();
  const { index } = req.params;

  const i = firms.findIndex((f) => f.id === index);
  if (i === -1) return res.status(404).send("Firma bulunamadı.");

  firms.splice(i, 1);
  writeFirms(firms);
  res.send("Firma silindi.");
};
