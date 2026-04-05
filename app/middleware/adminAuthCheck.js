const jwt = require("jsonwebtoken");

const StatusCode = require("../utils/StatusCode");

const adminAuthCheck = async (req, res, next) => {

  const token =
    req.body?.token ||
    req.query?.token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];


  if (!token) {
    return res.status(StatusCode.BAD_REQUEST).json({
      status: false,
      message: "Token is required for access this page",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.admin = decoded;

    console.log("afterlogin admin", req.user);

  } catch (error) {

    return res.status(StatusCode.BAD_REQUEST).json({
      status: false,
      message: "invalid token",
    });
  }

  return next();
};

module.exports = adminAuthCheck;
