
require("dotenv").config();

const mongoose = require("mongoose");

require("node:dns/promises").setServers(["1.1.1.1"]);

const DB_URL = process.env.DB_URL;

const DatabaseConnect = async () => {

  try {

    const connect = await mongoose.connect(DB_URL);

    if (connect) {

      console.log("🚀 MongoDB CONNECTED SUCCESSFULLY!!");

    } else {
      console.log("Database not connected");
    }

  } catch (err) {

    console.log(err);
  }
};

module.exports = DatabaseConnect;
