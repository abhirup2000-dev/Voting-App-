const Admin = require("../models/admin");
const Candidate = require("../models/candidate");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { setFlash } = require("../utils/flash");

const {
  adminSignupSchema,
  adminLoginSchema,
  updateProfileSchema,
  updatePasswordSchema,
  createCandidateSchema,
} = require("../utils/adminJoiValidation");
class AdminController {
  async adminSignup(req, res) {
    const { error, value } = adminSignupSchema.validate(req.body);

    if (error) {
      console.log(error);
      return res.redirect("/admin/signup");
    }
    const { name, email, phoneNumber, password } = value;

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
    } catch (error) {
      setFlash(req, "error", error.message);

      res.redirect("/admin/signup");
    }
  }

  async adminLogin(req, res) {
    const { error, value } = adminLoginSchema.validate(req.body);

    if (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
    const { email, password } = value;

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

      // const token = jwt.sign(
      //   { id: admin._id, role: "admin" },
      //   process.env.JWT_SECRET_KEY,
      //   { expiresIn: "1d" },
      // );

      // res.cookie("adminToken", token, {
      //   httpOnly: true,
      //   sameSite: "lax",
      // });

      const accessToken = jwt.sign(
        { id: admin._id, role: "admin" },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1m" },
      );

      const refreshToken = jwt.sign(
        { id: admin._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" },
      );

      admin.refreshToken = refreshToken;

      await admin.save();

      res.cookie("adminAccessToken", accessToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1 * 60 * 1000,
      });

      res.cookie("adminRefreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect("/admin/dashboard");
    } catch (error) {
      setFlash(req, "error", error.message);

      res.redirect("/admin/login");
    }
  }

  async createCandidate(req, res) {
    const { error, value } = await createCandidateSchema.validate(req.body)
    if (error) {
      console.log(error);
      return res.redirect("/admin/dashboard");
    }

    const { name, party, phone, password } = value

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

  async updateProfile(req, res) {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      console.log(error);
      return res.redirect("/admin/profile");
    }

    const { name, phoneNumber } = value;

    try {
      const admin = await Admin.findById(req.admin.id);

      if (!admin) {
        setFlash(req, "error", "Admin not found.");
        return res.redirect("/admin/profile");
      }

      admin.name = name || admin.name;

      admin.phoneNumber = phoneNumber || admin.phoneNumber;

      await admin.save();

      setFlash(req, "success", "Profile updated.");
      res.redirect("/admin/profile");
    } catch (err) {
      console.error(err);
      setFlash(req, "error", "Something went wrong.");
      res.redirect("/admin/profile");
    }
  }

  async updateAdminPassword(req, res) {
    const { error, value } = updatePasswordSchema.validate(req.body);
    if (error) {
      console.log(error);
      return res.redirect("/admin/profile");
    }
    const { oldPassword, newPassword } = value;

    if (!oldPassword || !newPassword || newPassword.length < 6) {
      setFlash(req, "error", "Invalid password.");
      return res.redirect("/admin/profile");
    }

    try {
      const admin = await Admin.findById(req.admin.id);

      if (!(await bcrypt.compare(oldPassword, admin.password))) {
        setFlash(req, "error", "Something Wrong old password not matched.");
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

  // adminLogout(req, res) {
  //   res.clearCookie("adminToken");
  //   res.redirect("/admin/login");
  // }

  async adminLogout(req, res) {

    try {

      const refreshToken = req.cookies.adminRefreshToken;

      if (refreshToken) {

        const admin = await Admin.findOne({ refreshToken });

        if (admin) {
          admin.refreshToken = null;
          await admin.save();
        }
      }

      res.clearCookie("adminAccessToken");

      res.clearCookie("adminRefreshToken");

      res.redirect("/admin/login");

    } catch (error) {

      console.error("Logout Error:", error);

      res.redirect("/admin/login");
    }
  }
}

module.exports = new AdminController();
