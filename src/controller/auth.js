const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config');

const userAuthToken = async (req, resp, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(400);
  }
  const userSearch = await User.findOne({ email });
  if (!userSearch) {
    resp.status(401).json({ message: 'No existe el usuario' });
    return next(401);
  }
  const matchPassword = await User.matchPassword(password, userSearch.password);
  if (!matchPassword) {
    resp.status(401).json({ message: 'Contraseña incorrecta' });
    return next(401);
  }
  const token = jwt.sign({ id: userSearch._id }, config.secret, {
    expiresIn: 86400, // 24 horas
  });
  resp.json({ token });
  next();
};

module.exports = { userAuthToken };
