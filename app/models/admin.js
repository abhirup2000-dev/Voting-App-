const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AdminSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    
    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role:{
      type: String,
      default: 'admin'
    }
  },
  {
    timestamps: true,
    versionKey: false,
  },
);


const AdminModel = mongoose.model('admin', AdminSchema)


module.exports = AdminModel
