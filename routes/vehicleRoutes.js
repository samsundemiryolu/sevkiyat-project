const express = require("express");
const router = express.Router();
const controller = require("../controllers/vehicleController");

router.get("/new", controller.showVehicleForm);   // EJS form sayfası
router.get("/list", controller.getVehicles);      // JSON liste
router.post("/save", controller.saveVehicle);     // Yeni kayıt


module.exports = router;
