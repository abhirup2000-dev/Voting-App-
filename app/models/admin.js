const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    password: {
      type: String,
      default: '1234@admin'
    },

    role: {
      type: String,
      enum: ["admin", "voter", "candidate"],
      default: "admin"
    },

    refreshToken: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const AdminModel = mongoose.model("admin", AdminSchema);

module.exports = AdminModel;