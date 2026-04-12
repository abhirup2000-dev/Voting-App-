const express = require("express");
const router = express.Router();

const voterController = require("../controllers/voterController");
const voterAuthCheck = require("../middleware/voterAuthCheck");


// PUBLIC ROUTES

router.post("/register", voterController.voterRegister);
router.post("/login", voterController.voterLogin);
router.post("/logout", voterController.voterLogout);

// PROTECTED ROUTES

// router.use(authCheck);

router.post(
  "/update-password",
  voterAuthCheck,
  voterController.voterUpdatePassword,
);
router.post("/submit-vote", voterAuthCheck, voterController.voterSubmitVote);

module.exports = router;