const flashMiddleware = (req, res, next) => {
  res.locals.flash = req.session?.flash || null;

  if (req.session) {
    delete req.session.flash;
  }

  next();
};

const setFlash = (req, type, message) => {
  if (!req.session) return;

  req.session.flash = { type, message };
};


module.exports = {flashMiddleware,setFlash};