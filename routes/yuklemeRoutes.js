const express = require("express");
const router = express.Router();
const controller = require("../controllers/yuklemeController");

const fs = require("fs");
const { paths } = require("../config"); // ✅ Burası eksikti

// GET /yukleme => yükleme listesini göster
router.get("/", controller.showYuklemeList);
router.post("/removeChecklistItem", controller.removeChecklistItem);
router.post("/restoreChecklistItem", controller.restoreChecklistItem);


router.get("/checklist", (req, res) => {
  const filePath = paths.checklists;
  if (!fs.existsSync(filePath)) return res.status(404).json([]);
  const content = fs.readFileSync(filePath, "utf-8");
  try {
    const data = JSON.parse(content);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Checklist JSON geçersiz" });
  }
});
module.exports = router;
