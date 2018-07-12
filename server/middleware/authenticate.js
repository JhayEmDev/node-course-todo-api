const {User} = require('../models/user');

const authenticate = async (req, res, next) => {
  const token = req.header('x-auth');
  let user;
  try {
    user = await User.findByToken(token);
    if (!user) Promise.reject();
  } catch (e) {
    res.status(401).send();
  }

  req.user = user;
  req.token = token;
  next();
};

module.exports = {authenticate};