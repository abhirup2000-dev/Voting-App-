const Candidate = require("../models/candidate");
const Result = require("../models/resultModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const StatusCode = require("../utils/StatusCode");
const { candidateLoginSchema } = require("../utils/candidateJoiValidation");


class CandidateController {

  // ===========================
  // Candidate Login
  // ===========================
  async loginCandidate(req, res) {
    try {
      const { error, value } = candidateLoginSchema.validate(req.body);
      if (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { phone, password } = value;

      const candidate = await Candidate.findOne({ phone: phone.trim() });

      if (!candidate) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Candidate not found",
        });
      }

      const isMatch = await bcrypt.compare(password, candidate.password);

      if (!isMatch) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign(
        {
          id: candidate._id,
          name: candidate.name,
          role: "candidate",
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
      );

      // store in cookie
      res.cookie("candidateToken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Candidate login successful",
        data: {
          id: candidate._id,
          name: candidate.name,
          party: candidate.party,
        }
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ===========================
  // Candidate Dashboard
  // ===========================
  async candidateDashboard(req, res) {
    try {
      const result = await Result.findOne({ isDeclared: true });

      // Result not declared
      if (!result) {
        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "Result not declared yet",
        });
      }

      // Result declared
      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Election Result",
        winner: result.results[0],
        results: result.results
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ===========================
  // View Result (optional route)
  // ===========================
  async viewResult(req, res) {
    try {
      const result = await Result.findOne({ isDeclared: true });

      if (!result) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Results are not out yet",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        winner: result.results[0],
        results: result.results
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ===========================
  // Candidate Logout
  // ===========================
  async logoutCandidate(req, res) {
    try {
      res.clearCookie("candidateToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: false
      }); // clear cookie

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Candidate logged out successfully"
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new CandidateController();