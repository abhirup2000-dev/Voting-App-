const setFlash = (req, type, msg) => {
  if (!req.session.flash) req.session.flash = [];
  req.session.flash.push({ type, msg });
};

const flashMiddleware = (req, res, next) => {
  res.locals.flash = req.session.flash || [];
  req.session.flash = []; // clear after use
  next();
};

module.exports = { setFlash, flashMiddleware };