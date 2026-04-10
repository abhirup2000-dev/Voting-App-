const express = require("express");
const router = express.Router();

const resultController = require("../controllers/resultController");
const adminAuth = require("../middleware/adminAuthCheck");
const authCheck = require("../middleware/authCheck");

// Admin declares result
router.post("/declare-result", adminAuth, resultController.declareResult);

// Everyone can view
router.get("/result", authCheck, resultController.getResult);

module.exports = router;