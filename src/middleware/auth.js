const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config');

module.exports = () => (req, resp, next) => {
  const { secret } = config;
  const { authorization } = req.headers;
  if (!authorization) {
    return next();
  }
  const [type, token] = authorization.split(' ');
  if (type.toLowerCase() !== 'bearer') {
    return next();
  }
  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      return next(403);
    }
    // TODO: Verificar identidad del usuario usando `decodeToken.uid`
    const user = User.findById(decodedToken.id);
    user
      .then((verifiedUser) => {
        if (!verifiedUser) return resp.status(400).json({ message: 'Usuario no encontrado' });
        req.authToken = decodedToken;
        return next();
      })
      .catch(() => next(403));
  });
};

module.exports.isAuthenticated = (req) => {
  if (req.authToken) return true;
  return false;
};

module.exports.isAdmin = async (req) => {
  // TODO: decidir por la informacion del request si la usuaria es admin
  const user = await User.findById(req.authToken.id);
  if (user.roles.admin) return true;
  return false;
};

module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);

module.exports.requireAdmin = (req, resp, next) => (
  // eslint-disable-next-line no-nested-ternary
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next()
);
