const express = require("express");
const router = express.Router();

const voterController = require("../controllers/voterController");
const authCheck = require("../middleware/authCheck");


// PUBLIC ROUTES

router.post("/register", voterController.voterRegister);
router.post("/login", voterController.voterLogin);
router.post("/logout", voterController.voterLogout);

// PROTECTED ROUTES

// router.use(authCheck);

router.post("/update-password",authCheck, voterController.voterUpdatePassword);
router.post("/submit-vote", authCheck, voterController.voterSubmitVote);

module.exports = router;