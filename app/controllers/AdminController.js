const Admin = require("../models/admin");
const Candidate = require("../models/candidate");
const Result = require("../models/resultModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { setFlash } = require("../utils/flash");

class AdminController {
  async adminSignup(req, res) {
    const { name, email, phoneNumber, password } = req.body;

    if (!name || !email || !phoneNumber || !password) {
      setFlash(req, "error", "All fields required.");
      return res.redirect("/admin/signup");
    }

    try {
      const exists = await Admin.findOne({
        $or: [{ email: email.toLowerCase() }, { phoneNumber }],
      });

      if (exists) {
        setFlash(req, "error", "Admin already exists.");
        return res.redirect("/admin/signup");
      }

      const hashed = await bcrypt.hash(password, 10);

      await Admin.create({
        name,
        email: email.toLowerCase(),
        phoneNumber,
        password: hashed,
        role: "admin",
      });

      setFlash(req, "success", "Signup successful.");
      res.redirect("/admin/login");
    } catch (err) {
      setFlash(req, "error", err.message);
      res.redirect("/admin/signup");
    }
  }

  async adminLogin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      setFlash(req, "error", "All fields required.");
      return res.redirect("/admin/login");
    }

    try {
      const admin = await Admin.findOne({ email: email.toLowerCase() });

      if (!admin || !(await bcrypt.compare(password, admin.password))) {
        setFlash(req, "error", "Invalid credentials.");
        return res.redirect("/admin/login");
      }

      const token = jwt.sign(
        { id: admin._id, role: "admin" },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" },
      );

      res.cookie("adminToken", token, {
        httpOnly: true,
        sameSite: "lax",
      });

      res.redirect("/admin/dashboard");
    } catch (err) {
      setFlash(req, "error", err.message);
      res.redirect("/admin/login");
    }
  }

  async createCandidate(req, res) {
    const { name, party, phone, password } = req.body;

    if (!name || !party || !phone || !password) {
      setFlash(req, "error", "All fields required.");
      return res.redirect("/admin/dashboard");
    }

    try {
      const exists = await Candidate.findOne({ phone });

      if (exists) {
        setFlash(req, "error", "Candidate exists.");
        return res.redirect("/admin/dashboard");
      }

      const hashed = await bcrypt.hash(password, 10);

      await Candidate.create({ name, party, phone, password: hashed });

      setFlash(req, "success", "Candidate added.");
      res.redirect("/admin/dashboard");
    } catch (err) {
      setFlash(req, "error", err.message);
      res.redirect("/admin/dashboard");
    }
  }

  async updateAdminPassword(req, res) {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword || newPassword.length < 6) {
      setFlash(req, "error", "Invalid password.");
      return res.redirect("/admin/profile");
    }

    try {
      const admin = await Admin.findById(req.admin.id);

      if (!(await bcrypt.compare(oldPassword, admin.password))) {
        setFlash(req, "error", "Wrong password.");
        return res.redirect("/admin/profile");
      }

      admin.password = await bcrypt.hash(newPassword, 10);
      await admin.save();

      setFlash(req, "success", "Password updated.");
      res.redirect("/admin/profile");
    } catch (err) {
      setFlash(req, "error", err.message);
      res.redirect("/admin/profile");
    }
  }

  adminLogout(req, res) {
    res.clearCookie("adminToken");
    res.redirect("/admin/login");
  }
}

module.exports = new AdminController();
