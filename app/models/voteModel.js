// models/voteModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const voteSchema = new Schema(
  {
    voterId: {
      type: Schema.Types.ObjectId,
      ref: "voter",
      required: true
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "candidate",
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("vote", voteSchema);