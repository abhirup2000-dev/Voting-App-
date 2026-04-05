
const express = require("express");

const router = express.Router();

const voterRoute = require("./voterRoute");

const AdminRoute = require('./AdminRoute')


router.use("/api/voter", voterRoute);
router.use("/api/admin", AdminRoute);




module.exports = router;