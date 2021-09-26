const User = require('../models/user');
const {
  emailValidation, passwordValidation, idValidation,
} = require('../services/validation');

module.exports = {
  getUsers: async (req, resp, next) => {
    try {
      const users = await User.find();
      return resp.json(users);
    } catch (error) {
      next(error);
    }
  },
  getUserById: async (req, resp, next) => {
    try {
      // obtener token de verificación para validar si es admin
      const userToken = await User.findById(req.authToken.id);
      const user = await User.findById(req.params.uid);
      if (!user) return next(404);
      // Si no es admin o el mismo usuario
      if (!userToken.roles.admin && !(userToken.email === user.email)) return next(403);
      return resp.json(user);
    } catch (error) {
      return next(error);
    }
  },
  addUser: async (req, resp, next) => {
    try {
      const { email, password, roles } = req.body;
      // Validación de email y contraseña
      if (!email || !password) return next(400);
      if (!emailValidation(email)) return resp.status(400).json({ message: 'Por favor, ingrese un email válido' });
      if (!passwordValidation(password)) return resp.status(400).json({ message: 'Por favor, ingrese una contraseña válida' });
      // Validamos si el correo ya esta registrado
      const searchUser = await User.findOne({ email });
      if (searchUser) return resp.status(403).json({ message: 'El email ya está registrado' });
      // Creamos usuario
      const newUser = new User({
        email,
        password: await User.encryptPassword(password),
        roles: ((!roles) || !(roles.admin)) ? { admin: false } : { admin: true },
      });
      // guardamos el usuario
      const savedUser = await newUser.save();
      return resp.json(savedUser);
    } catch (error) {
      return next(error);
    }
  },
  updateUserById: async (req, resp, next) => {
    try {
      // obtener token de verificación para validar si es admin
      const userToken = await User.findById(req.authToken.id);
      // Datos de usuario a modificar
      const { uid } = req.params;
      let user = null;
      // Validar si recibimos uid o email
      if (idValidation(uid)) { user = await User.findById(uid); }
      if (emailValidation(uid)) { user = await User.findOne({ email: uid }); }
      if (!user) return next(404);
      // Validar cuerpo de request
      if (!Object.keys(req.body).length) return next(400);
      let { email, password, roles } = req.body;
      // Si no es admin o el mismo usuario
      if (!userToken.roles.admin && !(userToken.email === user.email)) return next(403);
      if (!email) email = user.email;
      if (!password) password = user.password;
      if (!roles) roles = user.roles;
      // Validación roles
      if (user.roles !== roles) {
        if (!userToken.roles.admin && !user.roles.admin) return next(403);
        // Si usuario es admin e intenta modificar su rol
        user.roles = ((roles.admin)) ? { admin: true } : { admin: false };
      }
      // Validación email
      if (user.email !== email) {
        if (!emailValidation(email)) return resp.status(400).json({ message: 'Por favor, ingrese un email válido' });
        // Validamos si el correo ya esta registrado
        const searchUser = await User.findOne({ email });
        if (searchUser) return resp.status(403).json({ message: 'El email ya está registrado' });
        // Reasignamos el email
        user.email = email;
      }
      // Validación contraseña
      if (!(await User.matchPassword(password, user.password))) {
        if (!passwordValidation(password)) return resp.status(400).json({ message: 'Por favor, ingrese una contraseña válida' });
        // Reasignamos contraseña
        user.password = await User.encryptPassword(password);
      }
      // guardamos el usuario
      const updatedUser = await user.save();
      return resp.json(updatedUser);
    } catch (error) {
      return next(error);
    }
  },
  deleteUserById: async (req, resp, next) => {
    try {
      // obtener token de verificación para validar si es admin
      const userToken = await User.findById(req.authToken.id);
      // Datos de usuario a modificar
      const { uid } = req.params;
      let user = null;
      // Validar si recibimos uid o email
      if (idValidation(uid)) { user = await User.findById(uid); }
      if (emailValidation(uid)) { user = await User.findOne({ email: uid }); }
      if (!user) return next(404);
      // Si no es admin o el mismo usuario
      if (!userToken.roles.admin && !(userToken.email === user.email)) return next(403);
      await User.findByIdAndDelete(user.id);
      return resp.json(user);
    } catch (error) {
      return next(error);
    }
  },
};
