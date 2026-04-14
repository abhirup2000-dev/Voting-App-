const jwt = require("jsonwebtoken");

const Candidate = require("../models/candidate");

const candidateAuth = async (req, res, next) => {

  try {
    const accessToken = req.cookies.candidateAccessToken;

    const refreshToken = req.cookies.candidateRefreshToken;

    if (!accessToken && !refreshToken) {
      return res.redirect("/candidate/login");
    }

    //Verify access token
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);

        req.candidate = decoded;

        return next();

      } catch (error) {
        // expired → fallback to refresh
      }
    }

    //Refresh flow
    if (!refreshToken) {
      return res.redirect("/candidate/login");
    }

    let decodedRefresh;

    try {

      decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    } catch (error) {
      return res.redirect("/candidate/login");
    }

    const candidate = await Candidate.findById(decodedRefresh.id);

    if (!candidate || candidate.refreshToken !== refreshToken) {
      return res.redirect("/candidate/login");
    }

    //Generate new access token
    const newAccessToken = jwt.sign(
      { id: candidate._id, role: "candidate" },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1m" },
    );

    res.cookie("candidateAccessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1 * 60 * 1000,
    });

    req.candidate = { id: candidate._id, role: "candidate" };

    return next();

  } catch (error) {

    console.error("Candidate Auth Error:", error);

    res.redirect("/candidate/login");
  }
};

module.exports = candidateAuth;