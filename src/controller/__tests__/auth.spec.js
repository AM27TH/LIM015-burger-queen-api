const request = require('supertest');
const bcrypt = require('bcrypt');
const User = require('../../models/user');
const { connect, close } = require('../../database');
const app = require('../../app');

const adminUser = {
  email: 'auth@test.com',
  password: 'Auth@test123',
};

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

describe('POST /auth', () => {
  it('Should respond 400 for empty body', (done) => {
    request(app)
      .post('/auth')
      .send({})
      .expect(400, done);
  });
  it('Should 404 if the user does not exist', (done) => {
    request(app)
      .post('/auth')
      .send({ email: 'Test@gmail.com', password: 'Test.12345' })
      .expect(404, done);
  });
  it('Should respond 401 for invalid password', (done) => {
    request(app)
      .post('/auth')
      .send({ email: adminUser.email, password: 'Test.1234' })
      .expect(401, done);
  });
  it('Should respond 200 and return a token', (done) => {
    request(app)
      .post('/auth')
      .send({ email: adminUser.email, password: adminUser.password })
      .expect(200)
      .then((res) => {
        expect(res.body.token).toBeTruthy();
        done();
      });
  });
});
