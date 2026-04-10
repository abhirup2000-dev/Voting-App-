const express = require('express')

const adminController = require('../controllers/AdminController')

const adminAuthCheck = require('../middleware/adminAuthCheck')

const router = express.Router()


// router.post('/create-admin', adminController.adminSignup)

// router.post('/login', adminController.adminLogin)

// //protecting routes using middleware
// router.use(adminAuthCheck)

// router.get('/admin-dashboard', adminController.adminDashboard)

// router.post('/update-password', adminController.updateAdminPassword)

// ===========================
// PUBLIC ROUTES
// ===========================

// Admin Signup
router.post("/create-admin", adminController.adminSignup);

// Admin Login
router.post("/login", adminController.adminLogin);


// ===========================
// PROTECTED ROUTES (Admin Only)
// ===========================
router.use(adminAuthCheck);

// Dashboard
router.get("/admin-dashboard", adminController.adminDashboard);

// View Profile
router.get("/profile", adminController.viewAdminProfile);

// Update Profile
router.put("/update-profile", adminController.updateAdminProfile);

// Update Password
router.post("/update-password", adminController.updateAdminPassword);

// Create Candidate
router.post("/create-candidate", adminController.createCandidate);

// View Candidates
router.get("/candidates", adminController.listCandidates);

// View Voters who voted
router.get("/voters", adminController.viewVotersVotes);

//Admin LogOut
router.post("/logout", adminController.adminLogout);




module.exports = router