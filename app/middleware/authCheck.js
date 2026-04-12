const jwt = require("jsonwebtoken");
const StatusCode = require("../utils/StatusCode");

const authCheck = async (req, res, next) => {
  const token =
    req.cookies?.voterToken ||
    req.body?.token ||
    req.query?.token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];

  if (!token) {
    return res.status(StatusCode.BAD_REQUEST).json({
      success: false,
      message: "Token is required to access this page.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.voter = decoded; // attach voter info from token
    console.log("Logged in voter:", req.voter);

    next();
  } catch (error) {
    return res.status(StatusCode.UNAUTHORIZED).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authCheck;
