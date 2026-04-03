
const express = require("express");

const VoterController = require("../controllers/voterController");

const authchek = require("../middleware/authCheck");

const router = express.Router();

router.post("/create-voter", VoterController.registerVoter);

router.post("/login-voter", VoterController.loginVoter);

router.use(authchek);

router.get("/voter-dashboard", VoterController.voterDashboard);

router.put("/update-password", VoterController.updateVoterPassword);

router.post("/submit-vote", VoterController.submitVote);

module.exports = router;