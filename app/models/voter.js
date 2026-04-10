
// const mongoose = require("mongoose");

// const Schema = mongoose.Schema;

// const VoterSchema = new Schema(
//   {
//     name: {
//       type: String,
//       trim: true,
//       required: true,
//     },

//     phone: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     epicNumber: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     constituency: {
//       type: String,
//       trim: true,
//       required: true,
//     },

//     password: {
//       type: String,
//       minlength: 6,
//       required: true,
//     },

//     isVoted: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true,
//     versionKey: false,
//   },
// );


// const VoterModel = mongoose.model('voter', VoterSchema)


// module.exports = VoterModel

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

    isVoted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const VoterModel = mongoose.model("voter", VoterSchema);

module.exports = VoterModel;
