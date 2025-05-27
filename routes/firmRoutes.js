const express = require("express");
const router = express.Router();
const controller = require("../controllers/firmController");

router.get("/list", controller.getFirms);           // JSON listeleme
router.get("/add", controller.showFirmForm);        // Form sayfasını getir
router.post("/", controller.addFirm);               // Yeni firma ekle
router.delete("/delete/:index", controller.deleteFirm); // Firma sil
router.put("/update/:index", controller.updateFirm);    // Firma güncelle

module.exports = router;
