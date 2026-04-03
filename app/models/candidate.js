
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CandidateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    party: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    voterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "voter",
      required: true,
    },

    votedAt: {
      type: Date,
      default: Date.now(),
    },

    voteCount: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
  },
);


const CandidateModel = mongoose.model("candidate", CandidateSchema);


module.exports = CandidateModel;