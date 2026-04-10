
// const express = require("express");

// const VoterController = require("../controllers/voterController");

// const authchek = require("../middleware/authCheck");

// const router = express.Router();

// router.post("/create-voter", VoterController.registerVoter);

// router.post("/login-voter", VoterController.loginVoter);

// router.use(authchek);

// router.get("/voter-dashboard", VoterController.voterDashboard);

// router.put("/update-password", VoterController.updateVoterPassword);

// router.post("/submit-vote", VoterController.submitVote);

// module.exports = router;


const express = require("express");

const router = express.Router();

const voterController = require("../controllers/voterController");
const authCheck = require("../middleware/authCheck");

// ===========================
// PUBLIC ROUTES
// ===========================

// Register Voter
router.post("/create-voter", voterController.registerVoter);

// Login Voter
router.post("/login-voter", voterController.loginVoter);


// ===========================
// PROTECTED ROUTES (After Login)
// ===========================
router.use(authCheck);

// Dashboard (shows voter + candidates list)
router.get("/voter-dashboard", voterController.voterDashboard);

// Update Password
router.put("/update-password", voterController.updateVoterPassword);

// Submit Vote (only once)
router.post("/submit-vote", voterController.submitVote);

//Logout
router.post("/logout", voterController.logoutVoter);


module.exports = router;