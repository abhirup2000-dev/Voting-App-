const Admin = require("../models/admin");
const Candidate = require("../models/candidate");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/emailconfig");

const genPassword = require("../utils/passwordGenerator");

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
    const { name, email, phoneNumber } = value;

    if (!name || !email || !phoneNumber) {
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

      // Generate password
      const password = genPassword;

      const hashed = await bcrypt.hash(password, 10);

      await Admin.create({
        name,
        email: email.toLowerCase(),
        phoneNumber,
        password: hashed,
        role: "admin",
      });

      //login url
      const baseUrl = req.protocol + "://" + req.get("host");
      const loginUrl = baseUrl + "/admin/login";

      //sending credentials to mail id
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Your Login Credentials",
        html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0; padding:0; background-color:#f4f6f9; font-family: Arial, sans-serif;">
        <!-- Outer Wrapper (VERY IMPORTANT) -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding:20px 0;">
        <tr>
        <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden;">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4e73df,#224abe); padding:25px; text-align:center; color:#ffffff;">
            <h2 style="margin:0; font-size:22px;">Welcome 🎉</h2>
            <p style="margin:5px 0 0; font-size:14px;">
              VoteHub system
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:30px; color:#333333;">

            <p style="font-size:15px; margin:0 0 10px;">Hi,</p>

            <p style="font-size:14px; color:#555; line-height:1.6; margin:0 0 20px;">
              Your account has been successfully created. You can now log in using the credentials below:
            </p>

          <!-- Credentials -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fc; border:1px solid #e3e6f0; border-radius:8px;">
            <tr>
              <td style="padding:12px; font-size:14px;">
                <strong>Email:</strong> ${email}
              </td>
            </tr>
            <tr>
              <td style="padding:12px; font-size:14px;">
                <strong>Password:</strong> ${password}
              </td>
            </tr>
          </table>

          <!-- Warning -->
          <p style="font-size:13px; color:#e74a3b; margin:20px 0;">
            ⚠️ For security reasons, please change your password immediately after your first login.
          </p>

          <!-- Button -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:20px 0;">
                <a href="${loginUrl}" 
                   style="background:#4e73df; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:6px; font-size:14px; font-weight:bold; display:inline-block;">
                  Login Now
                </a>
              </td>
            </tr>
          </table>

          <p style="font-size:13px; color:#777;">
            If you did not request this account, please contact your administrator.
          </p>

        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f1f3f7; text-align:center; padding:15px; font-size:12px; color:#888;">
          © 2026 Employee Management System. All rights reserved.
        </td>
      </tr>

    </table>

     </td>
   </tr>

  </table>

   </body>
  </html>`,
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
    const { error, value } = await createCandidateSchema.validate(req.body);
    if (error) {
      console.log(error);
      return res.redirect("/admin/dashboard");
    }

    const { name, party, phone, password } = value;

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
