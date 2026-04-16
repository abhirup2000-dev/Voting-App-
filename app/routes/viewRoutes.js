
const express = require("express");
const router = express.Router();

const Voter = require("../models/voter");
const Admin = require("../models/admin");
const Candidate = require("../models/candidate");
const Result = require("../models/resultModel");
const Vote = require("../models/voteModel");
const candidateAuth = require("../middleware/candidateAuth");
const adminAuthCheck = require("../middleware/adminAuthCheck");
const voterAuthCheck = require("../middleware/voterAuthCheck");

const { setFlash } = require("../utils/flash");

// HOME (clear tokens)
router.get("/", (req, res) => {
  const options = {
    httpOnly: true,
    sameSite: "lax",
  };

  const cookiesToClear = [
    "voterAccessToken",
    "voterRefreshToken",
    "adminAccessToken",
    "adminRefreshToken",
    "candidateAccessToken",
    "candidateRefreshToken",
  ];

  cookiesToClear.forEach((token) => {
    res.clearCookie(token, options);
  });

  res.render("index");
});


//Voter
// Voter REGISTER
router.get("/voter/register", (req, res) => {
  res.render("voter/register");
});

// Voter LOGIN
router.get("/voter/login", (req, res) => {
  res.render("voter/login");
});

// Voter DASHBOARD
router.get("/voter/dashboard", voterAuthCheck, async (req, res) => {
  try {
    const voter = await Voter.findById(req.voter.id);
    if (!voter) {
      setFlash(req, "error", "Please login first");
      return res.redirect("/voter/login");
    }

    const candidates = await Candidate.find().select("name party _id");
    const resultDeclared = !!(await Result.findOne({ isDeclared: true }));

    res.render("voter/dashboard", {
      voter,
      candidates,
      resultDeclared,
    });
  } catch (err) {
    setFlash(req, "error", err.message);
    res.redirect("/voter/login");
  }
});


//Admin
// Admin SIGNUP
router.get("/admin/signup", (req, res) => {
  res.render("admin/signup");
});

// Admin LOGIN
router.get("/admin/login", (req, res) => {
  res.render("admin/login");
});

// Admin DASHBOARD
router.get("/admin/dashboard", adminAuthCheck, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");

    const candidates = await Candidate.find().select("name party phone");

    const voters = await Voter.find({ isVoted: true }).select(
      "name epicNumber constituency",
    );

    // LOOKUP LOGIC
    const results = await Vote.aggregate([
      {
        $lookup: {
          from: "voters", // collection name (IMPORTANT: plural + lowercase)
          localField: "voterId",
          foreignField: "_id",
          as: "voter",
        },
      },
      { $unwind: "$voter" },

      // 🔗 Join candidate details
      {
        $lookup: {
          from: "candidates",
          localField: "candidateId",
          foreignField: "_id",
          as: "candidate",
        },
      },
      { $unwind: "$candidate" },

      // Only voters who actually voted (extra safety)
      {
        $match: {
          "voter.isVoted": true,
        },
      },

      // 🎯 Final fields
      {
        $project: {
          _id: 0,
          name: "$voter.name",
          epicNumber: "$voter.epicNumber",
          constituency: "$voter.constituency",
          candidateName: "$candidate.name", // 👈 required field
          partyName: "$candidate.party", // 👈 required field
        },
      },
      // (optional) sort by latest vote
      {
        $sort: { createdAt: -1 },
      },
    ]);

    const result = await Result.findOne({ isDeclared: true });

    res.render("admin/dashboard", {
      admin,
      candidates,
      voters: results,
      result,
    });
  } catch (err) {
    setFlash(req, "error", err.message);
    res.redirect("/admin/login");
  }
});

// Admin PROFILE
router.get("/admin/profile", adminAuthCheck, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");

    res.render("admin/profile", { admin });
  } catch (err) {
    setFlash(req, "error", err.message);
    res.redirect("/admin/dashboard");
  }
});


//Candidate
// Candidate LOGIN
router.get("/candidate/login", (req, res) => {
  res.render("candidate/login");
});

// Candidate DASHBOARD
router.get("/candidate/dashboard", candidateAuth, async (req, res) => {
  try {
    const result = await Result.findOne({ isDeclared: true });

    res.render("candidate/dashboard", {
      candidateName: req.candidate.name,
      result: result || null,
    });
  } catch (err) {
    setFlash(req, "error", err.message);
    res.redirect("/candidate/login");
  }
});


//public route

// RESULT
router.get("/result", async (req, res) => {
  try {
    const result = await Result.findOne({ isDeclared: true });

    res.render("result", {
      result: result || null,
    });
  } catch (err) {
    res.render("result", { result: null });
  }
});

module.exports = router;
