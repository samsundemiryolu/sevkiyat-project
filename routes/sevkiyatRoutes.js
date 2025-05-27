// routes/sevkiyatRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/sevkiyatController");

// GET /sevkiyat => formu göster
router.get("/", controller.showSevkiyatForm);

// POST /sevkiyat/save => formdan gelen veriyi JSON'a kaydet
router.post("/save", controller.saveShipment);

// (Opsiyonel) GET /sevkiyat/list => tüm sevkiyatları getir
router.get("/list", controller.getShipments);

module.exports = router;
