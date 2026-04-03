
require("dotenv").config();

const express = require("express");

const cookieParser = require("cookie-parser");

const cors = require("cors");

const morgan = require("morgan");

const session = require("express-session");

const ejs = require("ejs");

const path = require("path");

const app = express();

const helmet = require("helmet");

const rateLimit = require("./app/utils/limiter");

app.use(cors());

app.use(morgan("dev"));

app.set("view engine", ejs);

app.set("views", "views");

app.use(
  helmet({
    contentSecurityPolicy: false,
    xDownloadOptions: false,
  }),
);

// Apply the rate limiting middleware to all requests.
app.use(rateLimit);

// database connection
const DatabaseConnect = require("./app/config/dbcon");
DatabaseConnect();

//define json
app.use(express.json());

// Parse form data
app.use(express.urlencoded({ extended: true }));

// ejs template engine
app.set('view engine', 'ejs');
app.set('views', 'views');

//static files
app.use(express.static(path.join(__dirname, "public")));
app.use("uploads", express.static(path.join(__dirname, "/uploads")));
app.use("/uploads", express.static("uploads"));


app.use(cookieParser());

app.use(
  session({
    secret: "keyboardcat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
);

//api routes
app.use(require("./app/routes/index"));

const port = 3004;

app.listen(port, () => {

  console.log("💻 SERVER SUCCESSFULLY CONNECTED TO", `http://localhost:${port}`);
});
