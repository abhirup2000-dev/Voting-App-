
const express = require("express");

const router = express.Router();

const voterRoute = require("./voterRoute");



router.use("/api/voter", voterRoute);


module.exports = router;