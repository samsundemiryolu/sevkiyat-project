// routes/sevkRoutes.js
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/sevkController");

router.get( "/",              ctrl.getSevkIslemleri);
router.get( "/shipments",     ctrl.getShipments);
router.post("/updateStatus",  ctrl.updateStatus);
router.post("/updatePayment", ctrl.updatePayment);

module.exports = router;
