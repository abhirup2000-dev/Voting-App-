require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("./app/utils/limiter");
const {flashMiddleware} = require('./app/utils/flash')

const app = express();

app.use(cors());
app.use(morgan("dev"));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(helmet({ contentSecurityPolicy: false, xDownloadOptions: false }));
app.use(rateLimit);

// DB
const DatabaseConnect = require("./app/config/dbcon");
DatabaseConnect();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cookieParser());

app.use(
  session({
    secret: "supersecretkey", // change this
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  }),
);
app.use(flashMiddleware);

// JSON API routes (existing)
app.use(require("./app/routes/index"));

// EJS view routes (server-side rendered)
app.use(require("./app/routes/viewRoutes"));

const port = process.env.PORT || 3004;
app.listen(port, () => {
  console.log(`💻 Server running at http://localhost:${port}`);
});
