
// const mongoose = require("mongoose");

// const Schema = mongoose.Schema;

// const CandidateSchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },

//     phone: {
//       type: String,
//       required: true,
//       unique: true
//     },

//     party: {
//       type: String,
//       required: true,
//     },

//     password: {
//       type: String,
//       required: true,
//     },

//     voteCount: {
//       type: Number,
//       default: 0,
//     },

//     votedAt: {
//       type: Date,
//       default: Date.now(),
//     },
//   },
//   {
//     versionKey: false,
//   },
// );


// const CandidateModel = mongoose.model("candidate", CandidateSchema);


// module.exports = CandidateModel;


const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CandidateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    party: {
      type: String,
      required: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    voteCount: {
      type: Number,
      default: 0
    },

    votedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false,
    timestamps: true, // optional: track createdAt and updatedAt
  }
);

const CandidateModel = mongoose.model("candidate", CandidateSchema);

module.exports = CandidateModel;