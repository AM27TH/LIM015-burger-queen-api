const User = require('../models/user');
const {
  emailValidation, passwordValidation,
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
      const user = await User.findById(req.params.uid);
      if (!user) return next(404);
      resp.status(200).json(user);
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
      await newUser.save();
      return resp.status(201).json({ message: 'Usuario creado' });
    } catch (error) {
      return next(error);
    }
  },
  updateUserById: (req, resp) => {
  },
  deleteUserById: (req, resp) => {
  },
};
