const requireLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized - Please login first" });
  }
  next();
};
module.exports = { requireLogin };