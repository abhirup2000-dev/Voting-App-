// models/resultModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const resultSchema = new Schema(
  {
    isDeclared: {
      type: Boolean,
      default: false
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: "candidate"
    },
    results: [
      {
        _id: { type: Schema.Types.ObjectId, ref: "candidate" },
        name: String,
        party: String,
        voteCount: Number
      }
    ]
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("result", resultSchema);