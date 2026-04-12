const Candidate = require("../models/candidate");
const Result = require("../models/resultModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const StatusCode = require("../utils/StatusCode");
const { candidateLoginSchema } = require("../utils/candidateJoiValidation");

class CandidateController {
  ///candidate controller func
  //CANDIDATE LOGIN
  async candidateLogin(req, res) {
    const { error, value } = candidateLoginSchema.validate(req.body);

      if (error) {
        setFlash(req, "error", error.details[0].message);
        return res.redirect("/candidate/login");
      }

      const { phone, password } = value;
    try {
      const candidate = await Candidate.findOne({ phone: phone.trim() });
      if (!candidate || !(await bcrypt.compare(password, candidate.password))) {
        flash(req, "error", "Invalid phone or password.");
        return res.redirect("/candidate/login");
      }
      const token = jwt.sign(
        { id: candidate._id, name: candidate.name, role: "candidate" },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" },
      );
      res.cookie("candidateToken", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 86400000,
      });
      res.redirect("/candidate/dashboard");
    } catch (err) {
      flash(req, "error", err.message);
      res.redirect("/candidate/login");
    }
  }

  //CANDIDATE LOGOUT
  async candidateLogout(req, res) {
    res.clearCookie("candidateToken");
    res.redirect("/candidate/login");
  }
}

module.exports = new CandidateController();
