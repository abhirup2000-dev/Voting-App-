const express = require("express");
const router = express.Router();

const candidateController = require("../controllers/candidateController");
const candidateAuth = require("../middleware/candidateAuth");

// ===========================
// PUBLIC ROUTES
// ===========================

// Login
router.post("/login", candidateController.loginCandidate);


// ===========================
// PROTECTED ROUTES
// ===========================
router.use(candidateAuth);

// Dashboard (BEST UX)
router.get("/dashboard", candidateController.candidateDashboard);

// View Result (optional)
router.get("/result", candidateController.viewResult);

// Logout
router.post("/logout", candidateController.logoutCandidate);

module.exports = router;