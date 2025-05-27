const express = require("express");
const router = express.Router();
const controller = require("../controllers/shipController");

router.get("/list", controller.getShipList);            // JSON listeleme
router.get("/add", controller.showShipForm);            // Form sayfasını getir
router.post("/", controller.createShip);                // Yeni kayıt
router.delete("/delete/:index", controller.deleteShip); // Silme
router.put("/update/:index", controller.updateShip);    // Güncelleme (opsiyonel)

module.exports = router;
