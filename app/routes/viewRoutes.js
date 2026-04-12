const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Voter = require("../models/voter");
const Admin = require("../models/admin");
const Candidate = require("../models/candidate");
const Vote = require("../models/voteModel");
const Result = require("../models/resultModel");

// Flash helper via session
function flash(req, type, msg) {
  req.session.flash = { type, msg };
}
function getFlash(req) {
  const f = req.session.flash || null;
  delete req.session.flash;
  return f;
}

// Token helpers
function decodeToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch {
    return null;
  }
}
function requireVoter(req, res, next) {
  const d = decodeToken(req.cookies.voterToken);
  if (!d) {
    flash(req, "error", "Please login to continue.");
    return res.redirect("/voter/login");
  }
  req.voter = d;
  next();
}
function requireAdmin(req, res, next) {
  const d = decodeToken(req.cookies.adminToken);
  if (!d || d.role !== "admin") {
    flash(req, "error", "Please login as admin.");
    return res.redirect("/admin/login");
  }
  req.admin = d;
  next();
}
function requireCandidate(req, res, next) {
  const d = decodeToken(req.cookies.candidateToken);
  if (!d || d.role !== "candidate") {
    flash(req, "error", "Please login.");
    return res.redirect("/candidate/login");
  }
  req.candidate = d;
  next();
}

// HOME
// router.get("/", (req, res) =>{
//   res.clearCookie("voterToken")
//   res.clearCookie("adminToken")
//   res.clearCookie("candidateToken")
//   res.render("index")});
router.get("/", (req, res) => {
  const options = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };

  ["voterToken", "adminToken", "candidateToken"].forEach(token =>
    res.clearCookie(token, options)
  );

  res.render("index");
});

//VOTER REGISTER
router.get("/voter/register", (req, res) =>
  res.render("voter/register", { flash: getFlash(req) }),
);
//VOTER LOGIN
router.get("/voter/login", (req, res) =>
  res.render("voter/login", { flash: getFlash(req) }),
);

//VOTER DASHBOARD
router.get("/voter/dashboard", requireVoter, async (req, res) => {
  try {
    const voter = await Voter.findById(req.voter.id);
    if (!voter) return res.redirect("/voter/login");
    const candidates = await Candidate.find().select("name party _id");
    const resultDeclared = !!(await Result.findOne({ isDeclared: true }));
    res.render("voter/dashboard", {
      flash: getFlash(req),
      voter,
      candidates,
      resultDeclared,
    });
  } catch (err) {
    flash(req, "error", err.message);
    res.redirect("/voter/login");
  }
});



//ADMIN SIGNUP
router.get("/admin/signup", (req, res) =>
  res.render("admin/signup", { flash: getFlash(req) }),
);

//ADMIN LOGIN
router.get("/admin/login", (req, res) =>
  res.render("admin/login", { flash: getFlash(req) }),
);

//ADMIN DASHBOARD
router.get("/admin/dashboard", requireAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    const candidates = await Candidate.find().select("name party phone");
    const voters = await Voter.find({ isVoted: true }).select(
      "name epicNumber constituency",
    );
    const result = await Result.findOne({ isDeclared: true });
    res.render("admin/dashboard", {
      flash: getFlash(req),
      admin,
      candidates,
      voters,
      result,
    });
  } catch (err) {
    flash(req, "error", err.message);
    res.redirect("/admin/login");
  }
});

//ADMIN PROFILE
router.get("/admin/profile", requireAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    res.render("admin/profile", { flash: getFlash(req), admin });
  } catch (err) {
    flash(req, "error", err.message);
    res.redirect("/admin/dashboard");
  }
});


//CANDIDATE LOGIN
router.get("/candidate/login", (req, res) =>
  res.render("candidate/login", { flash: getFlash(req) }),
);

//CANDIDATE DASHBOARD
router.get("/candidate/dashboard", requireCandidate, async (req, res) => {
  try {
    const result = await Result.findOne({ isDeclared: true });
    res.render("candidate/dashboard", {
      flash: getFlash(req),
      candidateName: req.candidate.name,
      result: result || null,
    });
  } catch (err) {
    flash(req, "error", err.message);
    res.redirect("/candidate/login");
  }
});


//PUBLIC RESULT
router.get("/result", async (req, res) => {
  try {
    const result = await Result.findOne({ isDeclared: true });
    res.render("result", { result: result || null });
  } catch (err) {
    res.render("result", { result: null });
  }
});




module.exports = router;
