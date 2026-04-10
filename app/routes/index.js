
const express = require("express");

const router = express.Router();

const voterRoute = require("./voterRoute");

const AdminRoute = require('./AdminRoute')

const candidateRoute = require('./candidateRoute')

const resultRoute = require("./resultRoute");




router.use("/api/voter", voterRoute);
router.use("/api/admin", AdminRoute);
router.use("/api/candidate", candidateRoute);
router.use("/api/result", resultRoute);



module.exports = router;