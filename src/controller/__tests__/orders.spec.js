/* const request = require('supertest');
const bcrypt = require('bcrypt');
const User = require('../../models/user');
const { connect, close } = require('../../database');
const app = require('../../app');

const adminUser = {
  email: 'orders@test.com',
  password: 'Orders@test123',
};
let adminToken = null;

beforeAll(() => {
  connect('mongodb://localhost:27017/test');
  // Agregar admin
  User.findOne({ email: adminUser.email })
    .then(async (user) => {
      // Crear usuario
      const adminAuth = new User({
        email: adminUser.email,
        password: bcrypt.hashSync(adminUser.password, 10),
        roles: { admin: true },
      });
      if (!user) await adminAuth.save();
    });
});

afterAll(async () => {
  await close();
});

const testUser = {
  email: 'user@orders.com',
  password: 'User@1234',
};
let testToken = null;

describe('POST /orders', () => {
});

describe('GET /orders', () => {
});

describe('GET /orders/:productId', () => {
});

describe('PUT /orders/:productId', () => {
});

describe('DELETE /orders/:productId', () => {
}); */
