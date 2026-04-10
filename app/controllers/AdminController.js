// const Admin = require("../models/admin");

// const bcrypt = require("bcrypt");

// const jwt = require("jsonwebtoken");

// const StatusCode = require("../utils/StatusCode");


// class AdminController {
//   async adminSignup(req, res) {
//     try {
//       const { name, email, phoneNumber, password } = req.body;

//       if (!name || !email || !phoneNumber || !password) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "All fields are required",
//         });
//       }

//       const existsAdmin = await Admin.findOne({ email });
//       if (existsAdmin) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "Admin already exists",
//         });
//       }

//       const HashedPassword = await bcrypt.hash(password, 10);

//       const adminData = await Admin.create({
//         name,
//         email,
//         phoneNumber,
//         password: HashedPassword,
//       });

//       return res.status(StatusCode.CREATED).json({
//         success: true,
//         message: "Admin created successfully",
//         admin: adminData,
//       });
//     } catch (err) {
//       return res.status(StatusCode.SERVER_ERROR).json({
//         success: false,
//         message: err.message,
//       });
//     }
//   }

//   async adminLogin(req, res) {
//     try {
//       const { email, password } = req.body;
//       if (!email || !password) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "All fields are required",
//         });
//       }

//       const user = await Admin.findOne({ email });
//       if (!user) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "Admin not found",
//         });
//       }

//       if (
//         (!user && user.role !== "admin") ||
//         !(await bcrypt.compare(password, user.password))
//       ) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "Unauthorized access, Invalid credentials",
//         });
//       }

//       const token = jwt.sign(
//         {
//           id: user._id,
//           name: user.name,
//           email: user.email,
//           about: user.about,
//         },
//         process.env.JWT_SECRET_KEY,
//         { expiresIn: "1h" },
//       );

//       return res.status(StatusCode.SUCCESS).json({
//         success: true,
//         message: "Admin logged in successfully",
//         admin: {
//           id: user._id,
//           name: user.name,
//           email: user.email,
//           about: user.about,
//         },
//         token: token,
//       });
//     } catch (err) {
//       return res.status(StatusCode.SERVER_ERROR).json({
//         success: false,
//         message: err.message,
//       });
//     }
//   }

//   // view dashboard
//   async adminDashboard(req, res) {
//     try {
//       const paramId = req.admin?.id || req.session?.admin?.id;

//       if (!paramId) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "ID is required",
//         });
//       }

//       const Admindata = await Admin.findById(paramId);

//       if (!Admindata) {
//         return res.status(StatusCode.NOT_FOUND).json({
//           success: false,
//           message: "Admin not found",
//         });
//       }

//       return res.status(StatusCode.SUCCESS).json({
//         success: true,
//         message: "welcome to the dashboard!!",
//         data: Admindata,
//       });
//     } catch (error) {
//       return res.status(StatusCode.SERVER_ERROR).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

//   // update password
//   async updateAdminPassword(req, res) {
//     try {
//       const userId = req.admin.id; 

//       const { oldPassword, newPassword } = req.body;

//       //validation
//       if (!oldPassword || !newPassword) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "Both old and new password are required",
//         });
//       }

//       //get user
//       const user = await Admin.findById(userId);

//       if (!user) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "Admin not found",
//         });
//       }

//       // check old password
//       const isMatch = await bcrypt.compare(oldPassword, user.password);

//       if (!isMatch) {
//         return res.status(StatusCode.UNAUTHORIZED).json({
//           success: false,
//           message: "Old password is incorrect",
//         });
//       }

//       if (newPassword.length < 6) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           message: "Password must be at least 6 characters",
//         });
//       }

//       // hash new password
//       const hashedPassword = await bcrypt.hash(newPassword, 10);

//       user.password = hashedPassword;

//       await user.save();

//       return res.status(StatusCode.SUCCESS).json({
//         success: true,
//         message: "Password updated successfully",
//       });
//     } catch (error) {
//       return res.status(StatusCode.SERVER_ERROR).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }
// }

// module.exports = new AdminController();


const Admin = require("../models/admin");
const Candidate = require("../models/candidate");
const Voter = require("../models/voter");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const StatusCode = require("../utils/StatusCode");

const {
  adminSignupSchema,
  adminLoginSchema,
  updateProfileSchema,
  updatePasswordSchema,
  createCandidateSchema
} = require("../utils/adminJoiValidation");


class AdminController {
  // ===========================
  // Admin Signup
  // ===========================
  async adminSignup(req, res) {
    try {

      const { error, value } = adminSignupSchema.validate(req.body);
      if (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { name, email, phoneNumber, password } = value;

      const existingAdmin = await Admin.findOne({
        $or: [
          { email: email.toLowerCase().trim() },
          { phoneNumber: phoneNumber.trim() },
        ],
      });
      if (existingAdmin) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Admin already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const adminData = await Admin.create({
        name,
        email,
        phoneNumber,
        password: hashedPassword,
        role: "admin",
      });

      const { password: _, ...safeAdmin } = adminData._doc;

      return res.status(StatusCode.CREATED).json({
        success: true,
        message: "Admin created successfully",
        admin: safeAdmin,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  // ===========================
  // Admin Login
  // ===========================
  async adminLogin(req, res) {
    try {

      const { error, value } = adminLoginSchema.validate(req.body);

      if (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { email, password } = value;

      const admin = await Admin.findOne({ email });
      if (!admin || admin.role !== "admin") {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign(
        {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1h" }
      );

      // 🍪 SET COOKIE
      res.cookie("adminToken", token, {
        httpOnly: true,        // 🔒 cannot access via JS
        secure: false,         // true in production (HTTPS)
        sameSite: "strict",    // CSRF protection
        maxAge: 1000 * 60 * 60 // 1 hour
      });


      const { password: _, ...safeAdmin } = admin._doc;

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Admin logged in successfully",
        admin: safeAdmin
      });
    } catch (err) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: err.message,
      });
    }
  }

  // ===========================
  // View Own Profile
  // ===========================
  async viewAdminProfile(req, res) {
    try {
      const adminId = req.admin?.id;
      if (!adminId) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Admin authentication required",
        });
      }

      const adminData = await Admin.findById(adminId).select("-password");

      if (!adminData) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Admin not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Admin profile details",
        admin: adminData,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ===========================
  // Update Own Profile
  // ===========================
  async updateAdminProfile(req, res) {
    try {

      const { error, value } = updateProfileSchema.validate(req.body);
      if (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details[0].message,
        });
      }
      const adminId = req.admin?.id;
      if (!adminId) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Admin authentication required",
        });
      }

      const updates = { ...value };

      // Prevent updating protected fields
      const forbiddenFields = ["role", "isActive", "_id", "password"];
      forbiddenFields.forEach((field) => delete updates[field]);

      // Trim and normalize fields
      if (updates.name) updates.name = updates.name.trim();
      if (updates.email) updates.email = updates.email.toLowerCase().trim();
      if (updates.phoneNumber) updates.phoneNumber = updates.phoneNumber.trim();

      // Check uniqueness for email
      if (updates.email) {
        const existingEmail = await Admin.findOne({ email: updates.email, _id: { $ne: adminId } });
        if (existingEmail) {
          return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "Email is already in use",
          });
        }
      }

      // Check uniqueness for phoneNumber
      if (updates.phoneNumber) {
        const existingPhone = await Admin.findOne({ 
          phoneNumber: updates.phoneNumber, 
          _id: { 
            $ne: adminId 
          } 
        });
        if (existingPhone) {
          return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "Phone number is already in use",
          });
        }
      }

      // Update admin profile
      const admin = await Admin.findByIdAndUpdate(adminId, updates, { new: true }).select("-password");

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Admin profile updated successfully",
        admin,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ===========================
  // Candidate/Party Creation Only
  // ===========================
  async createCandidate(req, res) {
    try {
      const { error, value } = createCandidateSchema.validate(req.body);
      if (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details[0].message,
        });
      }
      const { name, party, phone, password } = value;

      const candidateExists = await Candidate.findOne({ phone: value.phone });
      if (candidateExists) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Candidate already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const candidate = await Candidate.create({
        name,
        party,
        phone,
        password: hashedPassword,
        voteCount: 0,
      });

      return res.status(StatusCode.CREATED).json({
        success: true,
        message: "Candidate created successfully",
        candidate,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ===========================
  // List Candidates & Votes
  // ===========================
  async listCandidates(req, res) {
    try {
      const candidates = await Candidate.find().select("name party ");

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "List of candidates",
        data: candidates,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ===========================
  // View Voters Who Voted
  // ===========================
  async viewVotersVotes(req, res) {
    try {
      const voters = await Voter.find({ isVoted: true }).select(
        "name epicNumber constituency selectedCandidate"
      );

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Voters who have already voted",
        data: voters,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Admin Dashboard
  async adminDashboard(req, res) {
    try {
      const totalCandidates = await Candidate.countDocuments();
      const totalVoters = await Voter.countDocuments();
      const votedCount = await Voter.countDocuments({ isVoted: true });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Admin Dashboard",
        data: {
          totalCandidates,
          totalVoters,
          votedCount
        }
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateAdminPassword(req, res) {
    try {

      const { error, value } = updatePasswordSchema.validate(req.body);
      if (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details[0].message,
        });
      }
      const adminId = req.admin.id;
      const { oldPassword, newPassword } = value;

      const admin = await Admin.findById(adminId);

      if (!admin) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Admin not found"
        });
      }

      const isMatch = await bcrypt.compare(oldPassword, admin.password);

      if (!isMatch) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Old password incorrect"
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      admin.password = hashedPassword;

      await admin.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Password updated successfully"
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  // ===========================
  // Admin Logout
  // ===========================
  async adminLogout(req, res) {
    try {
      res.clearCookie("adminToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: false
      });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Admin logged out successfully",
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