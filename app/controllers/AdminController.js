const Admin = require("../models/admin");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const SatausCode = require("../utils/StatusCode");
const StatusCode = require("../utils/StatusCode");

class AdminController {
  async adminSignup(req, res) {
    try {
      const { name, email, phoneNumber, password } = req.body;

      if (!name || !email || !phoneNumber || !password) {
        return res.status(SatausCode.BAD_REQUEST).json({
          success: false,
          message: "All fields are required",
        });
      }

      const existsAdmin = await Admin.findOne({ email });
      if (existsAdmin) {
        return res.status(SatausCode.BAD_REQUEST).json({
          success: false,
          message: "Admin already exists",
        });
      }

      const HashedPassword = await bcrypt.hash(password, 10);

      const adminData = await Admin.create({
        name,
        email,
        phoneNumber,
        password: HashedPassword,
      });

      return res.status(SatausCode.CREATED).json({
        success: true,
        message: "Admin created successfully",
        admin: adminData,
      });
    } catch (err) {
      return res.status(SatausCode.SERVER_ERROR).json({
        success: false,
        message: err.message,
      });
    }
  }

  async adminLogin(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(SatausCode.BAD_REQUEST).json({
          success: false,
          message: "All fields are required",
        });
      }

      const user = await Admin.findOne({ email });
      if (!user) {
        return res.status(SatausCode.BAD_REQUEST).json({
          success: false,
          message: "Admin not found",
        });
      }

      if (
        (!user && user.role !== "admin") ||
        !(await bcrypt.compare(password, user.password))
      ) {
        return res.status(SatausCode.BAD_REQUEST).json({
          success: false,
          message: "Unauthorized access, Invalid credentials",
        });
      }

      const token = jwt.sign(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          about: user.about,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1h" },
      );

      return res.status(SatausCode.SUCCESS).json({
        success: true,
        message: "Admin logged in successfully",
        admin: {
          id: user._id,
          name: user.name,
          email: user.email,
          about: user.about,
        },
        token: token,
      });
    } catch (err) {
      return res.status(SatausCode.SERVER_ERROR).json({
        success: false,
        message: err.message,
      });
    }
  }

  // view dashboard
  async adminDashboard(req, res) {
    try {
      const paramId = req.user?.id || req.session?.user?.id;

      if (!paramId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "ID is required",
        });
      }

      const Admindata = await Admin.findById(paramId);

      if (!Admindata) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Admin not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "welcome to the dashboard!!",
        data: Admindata,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // update password
  async updateAdminPassword(req, res) {
    try {
      const userId = req.user.id; // ✅ from token

      const { oldPassword, newPassword } = req.body;

      //validation
      if (!oldPassword || !newPassword) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Both old and new password are required",
        });
      }

      //get user
      const user = await Admin.findById(userId);

      if (!user) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Admin not found",
        });
      }

      // check old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Old password is incorrect",
        });
      }

      if (newPassword.length < 6) {
        return res.status(StatusCode.BAD_REQUEST).json({
          message: "Password must be at least 6 characters",
        });
      }

      // hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;

      await user.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AdminController();
