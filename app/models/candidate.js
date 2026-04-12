const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CandidateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    party: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    voteCount: {
      type: Number,
      default: 0,
    },

    refreshToken: {
      type: String,
      default: null,
    },

    votedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: true, // optional: track createdAt and updatedAt
  },
);

const CandidateModel = mongoose.model("candidate", CandidateSchema);

module.exports = CandidateModel;