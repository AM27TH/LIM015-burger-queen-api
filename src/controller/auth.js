const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config');

const userAuthToken = async (req, resp, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(400);
    const user = await User.findOne({ email });
    if (!user) return next(404);
    const matchPassword = await User.matchPassword(password, user.password);
    if (!matchPassword) return resp.status(401).json({ message: 'Correo o contraseña incorrecta' });
    const token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400, // 24 horas
    });
    return resp.json({ token });
  } catch (error) {
    next(error);
  }
};

module.exports = { userAuthToken };
