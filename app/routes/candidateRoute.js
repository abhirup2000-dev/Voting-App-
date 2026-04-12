const express = require("express");
const router = express.Router();

const candidateController = require("../controllers/candidateController");
const candidateAuth = require("../middleware/candidateAuth");


// PUBLIC ROUTES

router.post("/login", candidateController.candidateLogin);
router.post("/logout", candidateController.candidateLogout);


module.exports = router;