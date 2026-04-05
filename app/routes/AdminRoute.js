const express = require('express')

const adminController = require('../controllers/AdminController')

const adminAuthCheck = require('../middleware/adminAuthCheck')

const router = express.Router()


router.post('/create-admin', adminController.adminSignup)

router.post('/login', adminController.adminLogin)

//protecting routes using middleware
router.use(adminAuthCheck)

router.get('/admin-dashboard', adminController.adminDashboard)

router.post('/update-password', adminController.updateAdminPassword)

module.exports = router