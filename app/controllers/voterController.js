const Voter = require("../models/voter");
const Candidate = require("../models/candidate");
const Vote = require("../models/voteModel");
const Result = require("../models/resultModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {setFlash} = require("../utils/flash");

const { voterRegisterSchema, voterLoginSchema, voterUpdatePasswordSchema } = require('../utils/voterJoiValidation')

class VoterController {
  async voterRegister(req, res) {
    try {

      const { error, value } = await voterRegisterSchema.validate(req.body)
      if(error){
        console.log(error)
        return res.redirect("/voter/register");
      }

      const { name, phone, epicNumber, constituency, password } = value

      if (!name || !phone || !epicNumber || !constituency || !password) {
        setFlash(req, "error", "All fields are required.");
        return res.redirect("/voter/register");
      }

      if (password.length < 6) {
        setFlash(req, "error", "Password must be at least 6 characters.");
        return res.redirect("/voter/register");
      }

      const exists = await Voter.findOne({ $or: [{ phone }, { epicNumber }] });

      if (exists) {
        setFlash(req, "error", "User already exists.");
        return res.redirect("/voter/register");
      }

      await Voter.create({
        name,
        phone,
        epicNumber,
        constituency,
        password: await bcrypt.hash(password, 10),
      });

      setFlash(req, "success", "Registration successful!");
      return res.redirect("/voter/login");
    } catch (err) {
      setFlash(req, "error", err.message);
      return res.redirect("/voter/register");
    }
  }

  async voterLogin(req, res) {
    try {

      const { error, value } = await voterLoginSchema.validate(req.body)
      if(error){
        console.log(error)
        return res.redirect("/voter/login");
      }
      const { epicNumber, password } = value

      if (!epicNumber || !password) {
        setFlash(req, "error", "All fields required.");
        return res.redirect("/voter/login");
      }

      const voter = await Voter.findOne({ epicNumber });

      if (!voter || !(await bcrypt.compare(password, voter.password))) {
        setFlash(req, "error", "Invalid credentials.");
        return res.redirect("/voter/login");
      }

      const token = jwt.sign({ id: voter._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "1d",
      });

      res.cookie("voterToken", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 86400000,
      });

      return res.redirect("/voter/dashboard");
    } catch (err) {
      setFlash(req, "error", err.message);
      return res.redirect("/voter/login");
    }
  }

  async voterSubmitVote(req, res) {
    try {
      const { candidateId } = req.body;

      if (!candidateId) {
        setFlash(req, "error", "Select a candidate.");
        return res.redirect("/voter/dashboard");
      }

      if (await Result.findOne({ isDeclared: true })) {
        setFlash(req, "error", "Voting closed.");
        return res.redirect("/voter/dashboard");
      }

      const voter = await Voter.findOneAndUpdate(
        { _id: req.voter.id, isVoted: false },
        { isVoted: true },
        { new: true },
      );

      if (!voter) {
        setFlash(req, "error", "Already voted.");
        return res.redirect("/voter/dashboard");
      }

      await Vote.create({ voterId: req.voter.id, candidateId });

      setFlash(req, "success", "Vote submitted!");
      return res.redirect("/voter/dashboard");
    } catch (err) {
      setFlash(req, "error", err.message);
      return res.redirect("/voter/dashboard");
    }
  }

  async voterUpdatePassword(req, res) {
    try {

      const { error, value } = await voterUpdatePasswordSchema.validate(req.body)
      if(error){
        console.log(error)
        return res.redirect("/voter/dashboard");
      }

      const { oldPassword, newPassword } = value

      if (!oldPassword || !newPassword || newPassword.length < 6) {
        setFlash(req, "error", "Invalid password.");
        return res.redirect("/voter/dashboard");
      }

      const voter = await Voter.findById(req.voter.id);

      if (!(await bcrypt.compare(oldPassword, voter.password))) {
        setFlash(req, "error", "Wrong password.");
        return res.redirect("/voter/dashboard");
      }

      voter.password = await bcrypt.hash(newPassword, 10);
      await voter.save();

      setFlash(req, "success", "Password updated.");
      console.log("success", "Password updated.");
      return res.redirect("/voter/dashboard");
    } catch (err) {
      setFlash(req, "error", err.message);
      console.log("error password not updated")
      return res.redirect("/voter/dashboard");
    }
  }

  voterLogout(req, res) {
    res.clearCookie("voterToken");
    return res.redirect("/voter/login");
  }
}

module.exports = new VoterController();
