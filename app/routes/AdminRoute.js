const express = require("express");
const router = express.Router();

const adminController = require("../controllers/AdminController");
const adminAuthCheck = require("../middleware/adminAuthCheck");

// PUBLIC ROUTES

router.post("/signup", adminController.adminSignup);
router.post("/login", adminController.adminLogin);
router.post("/logout", adminController.adminLogout);

// PROTECTED ROUTES

router.post("/update-profile", adminAuthCheck, adminController.updateProfile);

router.post("/update-password", adminAuthCheck, adminController.updateAdminPassword);

router.post("/add-candidate", adminAuthCheck, adminController.createCandidate);


module.exports = router;