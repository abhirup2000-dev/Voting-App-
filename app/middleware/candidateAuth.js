const jwt = require("jsonwebtoken");
const StatusCode = require("../utils/StatusCode");

const candidateAuth = (req, res, next) => {
  const token =
    req.cookies?.candidateToken||
    req.body?.token ||
    req.query?.token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];

  if (!token) {
    return res.status(StatusCode.BAD_REQUEST).json({
      success: false,
      message: "Token is required for access",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Ensure the token belongs to a candidate
    if (decoded.role !== "candidate") {
      return res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized: Candidate access only",
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(StatusCode.UNAUTHORIZED).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = candidateAuth;