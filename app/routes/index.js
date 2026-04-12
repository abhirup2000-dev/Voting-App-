const express = require("express");
const router = express.Router();

const voterRoute = require("./voterRoute");
const AdminRoute = require("./AdminRoute");
const candidateRoute = require("./candidateRoute");
const resultRoute = require("./resultRoute");

router.use("/voter", voterRoute);
router.use("/admin", AdminRoute);
router.use("/candidate", candidateRoute);
router.use("/result", resultRoute);

module.exports = router;