const fs = require("fs");
const path = require("path");
const { baseUrl, paths } = require("../config"); // config.js içinden alınıyor

const dataPath = paths.ships;

// JSON'dan veri oku
function loadShips() {
    if (!fs.existsSync(dataPath)) return [];
    const content = fs.readFileSync(dataPath, { encoding: "utf8" });
    return content ? JSON.parse(content) : [];
}

// JSON'a veri yaz
function saveShips(ships) {
    fs.writeFileSync(dataPath, JSON.stringify(ships, null, 2), { encoding: "utf8" });
}

// ✅ Gemi listesini döndür (JSON)
function getShipList(req, res) {
    const ships = loadShips();
    res.json(ships);
}

// ✅ Gemi formunu göster (EJS)
function showShipForm(req, res) {
    res.render("shipForm", {
        baseUrl,
        ship: {},
        error: "",
        message: ""
    });
}

// ✅ Yeni gemi ekle
function createShip(req, res) {
    const { summaryNumber, name, arrivalDate } = req.body;

    if (!summaryNumber || !name || !arrivalDate) {
        return res.render("shipForm", {
            baseUrl,
            ship: req.body,
            error: "Tüm alanlar zorunludur!",
            message: ""
        });
    }

    const ships = loadShips();
    const isDuplicate = ships.some(s => s.summaryNumber === summaryNumber);
    if (isDuplicate) {
        return res.render("shipForm", {
            baseUrl,
            ship: req.body,
            error: "Bu özet beyan numarası zaten kayıtlı!",
            message: ""
        });
    }

    const newShip = { summaryNumber, name, arrivalDate };
    ships.push(newShip);
    saveShips(ships);

    res.render("shipForm", {
        baseUrl,
        ship: {},
        error: "",
        message: "Gemi başarıyla kaydedildi!"
    });
}

// ✅ Kayıt sil
function deleteShip(req, res) {
    const index = parseInt(req.params.index);
    if (isNaN(index)) return res.status(400).send("Geçersiz index.");

    const ships = loadShips();
    if (index < 0 || index >= ships.length) return res.status(404).send("Kayıt bulunamadı.");

    ships.splice(index, 1);
    saveShips(ships);
    res.send("Gemi silindi.");
}

// ✅ Kayıt güncelle
function updateShip(req, res) {
    const index = parseInt(req.params.index);
    if (isNaN(index)) return res.status(400).send("Geçersiz index.");

    const ships = loadShips();
    if (index < 0 || index >= ships.length) return res.status(404).send("Kayıt bulunamadı.");

    const { summaryNumber, name, arrivalDate } = req.body;
    if (!summaryNumber || !name || !arrivalDate) {
        return res.status(400).send("Tüm alanlar zorunludur!");
    }

    ships[index] = { summaryNumber, name, arrivalDate };
    saveShips(ships);
    res.send("Güncelleme başarılı.");
}

// 🔁 Export işlemi
module.exports = {
    getShipList,
    showShipForm,
    createShip,
    deleteShip,
    updateShip
};
