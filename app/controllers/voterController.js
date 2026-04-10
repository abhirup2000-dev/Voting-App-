
// const Voter = require("../models/voter");

// const Candidate = require("../models/candidate");

// const bcrypt = require("bcrypt");

// const jwt = require("jsonwebtoken");

// const StatusCode = require("../utils/StatusCode");

// class VoterController {
//   async registerVoter(req, res) {
//     try {
//       const { name, phone, epicNumber, constituency, password } = req.body;

//       if (!name || !phone || !epicNumber || !constituency || !password) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "all fields are required",
//         });
//       }

//       const existVoter = await Voter.findOne({ phone });

//       if (existVoter) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "voter already exist",
//         });
//       }

//       const salt = await bcrypt.genSalt(10);

//       const hashedpassword = await bcrypt.hash(password, salt);

//       const voterdata = new Voter({
//         name,
//         phone,
//         epicNumber,
//         constituency,
//         password: hashedpassword,
//       });

//       const data = await voterdata.save();

//       return res.status(StatusCode.SUCCESS).json({
//         success: true,
//         message: "voter registered successfull!!",
//         data: data,
//       });
//     } catch (error) {
//       return res.status(StatusCode.BAD_REQUEST).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

//   async loginVoter(req, res) {
//     try {
//       const { epicNumber, password } = req.body;

//       if (!epicNumber || !password) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "all fields are required",
//         });
//       }

//       const voter = await Voter.findOne({ epicNumber });

//       if (!voter) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "voter not found",
//         });
//       }

//       const isMatch = await bcrypt.compare(password, voter.password);

//       if (!isMatch) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "password does not match",
//         });
//       }

//       if (voter) {
//         const token = jwt.sign(
//           {
//             id: voter._id,
//             name: voter.name,
//             phone: voter.phone,
//             epicNumber: voter.epicNumber,
//             constituency: voter.constituency,
//           },
//           process.env.JWT_SECRET_KEY,
//           { expiresIn: "1d" },
//         );

//         return res.status(StatusCode.SUCCESS).json({
//           success: true,
//           message: "voter login successfull!!",
//           data: {
//             id: voter._id,
//             name: voter.name,
//             phone: voter.phone,
//             epicNumber: voter.epicNumber,
//             constituency: voter.constituency,
//           },
//           token: token,
//         });
//       } else {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "voter not found",
//         });
//       }
//     } catch (error) {
//       return res.status(StatusCode.SERVER_ERROR).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

//   // view dashboard
//   async voterDashboard(req, res) {
//     try {
//       const paramId = req.user?.id || req.session?.user?.id;

//       if (!paramId) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "ID is required",
//         });
//       }

//       const voterdata = await Voter.findById(paramId);

//       if (!voterdata) {
//         return res.status(StatusCode.NOT_FOUND).json({
//           success: false,
//           message: "Voter not found",
//         });
//       }

//       return res.status(StatusCode.SUCCESS).json({
//         success: true,
//         message: "welcome to the dashboard!!",
//         data: voterdata,
//       });
//     } catch (error) {
//       return res.status(StatusCode.SERVER_ERROR).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

//   // update password
//   async updateVoterPassword(req, res) {
//     try {
//       const userId = req.user.id; // ✅ from token

//       const { oldPassword, newPassword } = req.body;

//       //validation
//       if (!oldPassword || !newPassword) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "Both old and new password are required",
//         });
//       }

//       //get user
//       const user = await Voter.findById(userId);

//       if (!user) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "Voter not found",
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

//   //vote submission
//   async submitVote(req, res) {
//     try {
//       const voterId = req.user?.id;

//       if (!voterId) {
//         return res.status(StatusCode.BAD_REQUEST).json({
//           success: false,
//           message: "Unauthorized",
//         });
//       }

//       const { candidateId } = req.body;

//       if (!candidateId) {
//         return res.status(StatusCode.BAD_GATEWAY).json({
//           success: false,
//           message: "Candidate ID is required",
//         });
//       }

//       //Check candidate exists
//       const candidate = await Candidate.findById(candidateId);

//       if (!candidate) {
//         return res.status(StatusCode.NOT_FOUND).json({
//           success: false,
//           message: "Candidate not found",
//         });
//       }

//       // Atomic update to prevent double voting
//       const voter = await Voter.findOneAndUpdate(
//         { _id: voterId, isVoted: false },
//         { isVoted: true },
//         { new: true },
//       );

//       if (!voter) {
//         return res.status(StatusCode.FORBIDDEN).json({
//           success: false,
//           message: "You have already voted",
//         });
//       }

//       // Increment vote safely
//       await Candidate.findByIdAndUpdate(candidateId, {
//         $inc: { voteCount: 1 },
//       });

//       return res.status(StatusCode.SUCCESS).json({
//         success: true,
//         message: "Vote casted successfully",
//       });

//     } catch (error) {
//       return res.status(StatusCode.SERVER_ERROR).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }
// }


// module.exports = new VoterController();



const Voter = require("../models/voter");

const Candidate = require("../models/candidate");

const Vote = require("../models/voteModel");

const Result = require("../models/resultModel");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const StatusCode = require("../utils/StatusCode");


const { 
  voterRegisterSchema,
  voterLoginSchema,
  voterUpdatePasswordSchema,
  voterVoteSchema 
} = require("../utils/voterJoiValidation.js");

class VoterController {
  async registerVoter(req, res) {
    try {

      const { error, value } = voterRegisterSchema.validate(req.body);
      if (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { name, phone, epicNumber, constituency, password } = value;

      const existVoter = await Voter.findOne({ phone });

      if (existVoter) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "voter already exist",
        });
      }

      const salt = await bcrypt.genSalt(10);

      const hashedpassword = await bcrypt.hash(password, salt);

      const voterdata = new Voter({
        name,
        phone,
        epicNumber,
        constituency,
        password: hashedpassword,
      });

      const data = await voterdata.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "voter registered successfull!!",
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  async loginVoter(req, res) {
    try {

      const { error, value } = voterLoginSchema.validate(req.body);
      if (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { epicNumber, password } = value;

      const voter = await Voter.findOne({ epicNumber });

      if (!voter) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "voter not found",
        });
      }

      const isMatch = await bcrypt.compare(password, voter.password);

      if (!isMatch) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "password does not match",
        });
      }

      if (voter) {
        const token = jwt.sign(
          {
            id: voter._id,
            name: voter.name,
            phone: voter.phone,
            epicNumber: voter.epicNumber,
            constituency: voter.constituency,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1d" },
        );

        //STORE IN COOKIE
        res.cookie("voterToken", token, {
          httpOnly: true,
          secure: false, // true in production (HTTPS)
          sameSite: "lax",
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });


        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "voter login successfull!!",
          data: {
            id: voter._id,
            name: voter.name,
            phone: voter.phone,
            epicNumber: voter.epicNumber,
            constituency: voter.constituency,
          }

        });
      } else {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "voter not found",
        });
      }
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // view dashboard
  async voterDashboard(req, res) {
    try {
      const paramId = req.user?.id || req.session?.user?.id;

      if (!paramId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "ID is required",
        });
      }

      const voterdata = await Voter.findById(paramId);

      if (!voterdata) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Voter not found",
        });
      }

      const candidates = await Candidate.find().select("name party _id");
      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "welcome to the dashboard!!",
        data: voterdata,
        candidates: candidates
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // update password
  async updateVoterPassword(req, res) {
    try {

      const { error, value } = voterUpdatePasswordSchema.validate(req.body);
      if (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const userId = req.user.id; // from token

      const { oldPassword, newPassword } = value;

      //get user
      const user = await Voter.findById(userId);

      if (!user) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Voter not found",
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

  //vote submission
  async submitVote(req, res) {
    try {

      const { error, value } = voterVoteSchema.validate(req.body);
      if (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const voterId = req.user?.id;

      // ❗ stop voting after result
      const resultDeclared = await Result.findOne({ isDeclared: true });

      if (resultDeclared) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Voting closed. Result declared"
        });
      }

      const { candidateId } = value;

      const candidate = await Candidate.findById(candidateId);
      if (!candidate) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Candidate not found",
        });
      }

      const voter = await Voter.findOneAndUpdate(
        { _id: voterId, isVoted: false },
        { isVoted: true },
        { new: true }
      );

      if (!voter) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "You have already voted",
        });
      }

      // SAVE vote (IMPORTANT)
      await Vote.create({
        voterId,
        candidateId
      });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Vote casted successfully",
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ===========================
  // Voter Logout
  // ===========================
  async logoutVoter(req, res) {
    try {
      res.clearCookie("voterToken"); //clear cookie

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Voter logged out successfully",
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }


}


module.exports = new VoterController();