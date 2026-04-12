const jwt = require("jsonwebtoken");

const Admin = require("../models/admin");

const adminAuthCheck = async (req, res, next) => {

  try {

    const accessToken = req.cookies.adminAccessToken;

    const refreshToken = req.cookies.adminRefreshToken;

    // ❌ No tokens
    if (!accessToken && !refreshToken) {
      return res.redirect("/admin/login");
    }

    // ✅ Verify Access Token
    if (accessToken) {

      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);

        req.admin = decoded; // attach admin info

        return next();

      } catch (error) {
        // Access token expired → handled below
      }
    }

    // 🔄 If access token failed → use refresh token

    if (!refreshToken) {

      return res.redirect("/admin/login");
    }

    let decodedRefresh;

    try {

      decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    } catch (error) {

      return res.redirect("/admin/login");
    }

    // 🧠 Check DB for valid refresh token
    const admin = await Admin.findById(decodedRefresh.id);

    if (!admin || admin.refreshToken !== refreshToken) {
      return res.redirect("/admin/login");
    }

    // 🔁 Generate new access token
    const newAccessToken = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" },
    );

    // 🍪 Set new access token
    res.cookie("adminAccessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    req.admin = { id: admin._id, role: "admin" };

    return next();

  } catch (error) {

    console.error("Auth Middleware Error:", error);

    return res.redirect("/admin/login");
  }
};

module.exports = adminAuthCheck;
