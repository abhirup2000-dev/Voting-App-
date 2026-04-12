
const Candidate = require("../models/candidate");
const Result = require("../models/resultModel");
const StatusCode = require("../utils/StatusCode");

class ResultController {

  // ADMIN DECLARE RESULT
  async declareResult(req, res) {
    try {

      // Check already declared
      const existing = await Result.findOne({ isDeclared: true });
      if (existing) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Result already declared"
        });
      }

      // LOOKUP LOGIC
      const results = await Candidate.aggregate([
        {
          $lookup: {
            from: "votes", // collection name
            localField: "_id",
            foreignField: "candidateId",
            as: "votes"
          }
        },
        {
          $project: {
            name: 1,
            party: 1,
            voteCount: { $size: "$votes" }
          }
        },
        {
          $sort: { voteCount: -1 }
        }
      ]);

      if (!results.length) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "No votes found"
        });
      }

      const winner = results[0];

      // Save result
      await Result.create({
        isDeclared: true,
        winner: winner._id,
        results
      });

      return res.redirect("/admin/dashboard");
      // return res.status(StatusCode.SUCCESS).json({
      //   success: true,
      //   message: "Result declared successfully",
      //   winner,
      //   results
      // });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }


  // VIEW RESULT (ALL)

  async getResult(req, res) {
    try {
      const result = await Result.findOne({ isDeclared: true });

      if (!result) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Result not declared yet"
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
        message: error.message
      });
    }
  }
}

module.exports = new ResultController();