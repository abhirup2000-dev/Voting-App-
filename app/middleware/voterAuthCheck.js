const jwt = require("jsonwebtoken");

const Voter = require("../models/voter");

const voterAuthCheck = async (req, res, next) => {

  try {

    const accessToken = req.cookies.voterAccessToken;

    const refreshToken = req.cookies.voterRefreshToken;

    if (!accessToken && !refreshToken) {
      return res.redirect("/voter/login");
    }

    // ✅ Try access token
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);

        req.voter = decoded;

        return next();
        
      } catch (error) {
        // expired → go to refresh
      }
    }

    // 🔄 Refresh flow
    if (!refreshToken) {

      return res.redirect("/voter/login");
    }

    let decodedRefresh;

    try {

      decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    } catch (error) {

      return res.redirect("/voter/login");
    }

    const voter = await Voter.findById(decodedRefresh.id);

    if (!voter || voter.refreshToken !== refreshToken) {
      return res.redirect("/voter/login");
    }

    // 🔁 New access token
    const newAccessToken = jwt.sign(
      { id: voter._id, role: "voter" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    res.cookie("voterAccessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    req.voter = { id: voter._id, role: "voter" };

    return next();

  } catch (error) {

    console.error("Voter Auth Error:", error);

    res.redirect("/voter/login");
  }
};

module.exports = voterAuthCheck;
