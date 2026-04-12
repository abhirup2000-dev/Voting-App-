const Candidate = require("../models/candidate");
const Result = require("../models/resultModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
      // const token = jwt.sign(

      //   { id: candidate._id, name: candidate.name, role: "candidate" },
      //   process.env.JWT_SECRET_KEY,
      //   { expiresIn: "1d" },
      // );
      // res.cookie("candidateToken", token, {
      //   httpOnly: true,
      //   sameSite: "lax",
      //   maxAge: 86400000,
      // });

      // 🔑 Access Token
      const accessToken = jwt.sign(
        { id: candidate._id, name: candidate.name, role: "candidate" },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "15m" },
      );

      // 🔄 Refresh Token
      const refreshToken = jwt.sign(
        { id: candidate._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" },
      );

      // Save refresh token
      candidate.refreshToken = refreshToken;

      await candidate.save();

      // 🍪 Cookies
      res.cookie("candidateAccessToken", accessToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("candidateRefreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect("/candidate/dashboard");

    } catch (error) {

      flash(req, "error", error.message);

      res.redirect("/candidate/login");
    }
  }

  //CANDIDATE LOGOUT
  async candidateLogout(req, res) {

    try {

      const refreshToken = req.cookies.candidateRefreshToken;

      if (refreshToken) {

        const candidate = await Candidate.findOne({ refreshToken });
        if (candidate) {
          candidate.refreshToken = null;
          await candidate.save();
        }
      }

      res.clearCookie("candidateAccessToken");

      res.clearCookie("candidateRefreshToken");

      res.redirect("/candidate/login");

    } catch (error) {

      console.error("Logout Error:", error);
      res.redirect("/candidate/login");
    }
  }
}

module.exports = new CandidateController();
