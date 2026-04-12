const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VoterSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    epicNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // optional: EPIC numbers usually uppercase
    },

    constituency: {
      type: String,
      trim: true,
      required: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    refreshToken: {
      type: String,
      default: null,
    },

    isVoted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const VoterModel = mongoose.model("voter", VoterSchema);

module.exports = VoterModel;
