const request = require('supertest');
const { connect, close } = require('../../database');
const app = require('../../app');
const config = require('../../config');

beforeAll(() => connect('mongodb://localhost:27017/test'));

afterAll(async () => {
  await close();
});

const adminUser = {
  email: config.adminEmail,
  password: config.adminPassword,
};
let adminToken = null;

const testUser = {
  email: 'user@test.com',
  password: 'User@123456',
};
let testToken = null;
let idUser = null;

describe('GET /users', () => {
  it('should return 401 when not auth', (done) => {
    request(app)
      .get('/users')
      .expect('Content-Type', /application\/json/)
      .expect(401, done);
  });
  it('Should return 403 when no Admin', (done) => {
    request(app)
      .post('/auth')
      .send(testUser)
      .then((resp) => {
        testToken = resp.body.token;
        request(app)
          .get('/users')
          .set('Authorization', `Bearer ${testToken}`)
          .expect('Content-Type', /application\/json/)
          .expect(403, done);
      });
  });
  it('Should return 200 and list of users', (done) => {
    request(app)
      .post('/auth')
      .send(adminUser)
      .expect(200)
      .then(((resp) => {
        adminToken = resp.body.token;
        request(app)
          .get('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(({ headers, body }) => {
            expect(headers.link).toBeTruthy();
            expect(body.length > 0).toBe(true);
            expect(Array.isArray(body)).toBe(true);
            done();
          });
      }));
  });
});

describe('POST /users', () => {
  it('should return 400 when email and password are missing', (done) => {
    request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe('Bad request');
        done();
      });
  });
  it('should return 400 when invalid email', (done) => {
    request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'user@test', password: '12345678' })
      .expect('Content-Type', /application\/json/)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe('Por favor, ingrese un email válido');
        done();
      });
  });
  it('should return 400 when invalid password', (done) => {
    request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'user@test.com', password: '12345678' })
      .expect('Content-Type', /application\/json/)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe('Por favor, ingrese una contraseña válida');
        done();
      });
  });
  it('should return 403 when user is already registered', (done) => {
    request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(adminUser)
      .expect('Content-Type', /application\/json/)
      .expect(403)
      .then((response) => {
        expect(response.body.message).toBe('El email ya está registrado');
        done();
      });
  });
  it('should return 200 and create new user as admin', (done) => {
    request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(testUser)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then((response) => {
        idUser = response.body._id;
        expect(typeof response.body.email).toBe('string');
        expect(typeof response.body._id).toBe('string');
        expect(response.body.roles.admin).not.toBeTruthy();
        expect(typeof response.password).toBe('undefined');
        done();
      });
  });
  it('should return 200 and create new admin user as admin', (done) => {
    request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'adminTest@test.com', password: 'As.123456', roles: { admin: true } })
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then((response) => {
        expect(typeof response.body.email).toBe('string');
        expect(typeof response.body._id).toBe('string');
        expect(response.body.roles.admin).toBeTruthy();
        expect(typeof response.password).toBe('undefined');
        done();
      });
  });
});

describe('GET /users/:uid', () => {
  it('should return 401 when not auth', (done) => {
    request(app)
      .get(`/users/${adminUser.email}`)
      .expect('Content-Type', /application\/json/)
      .expect(401, done);
  });
  it('should return 404 when id or email format are wrong', (done) => {
    request(app)
      .get('/users/test@user')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(404, done);
  });
  it('should return 404 when not found', (done) => {
    request(app)
      .get('/users/user@test.test')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(404, done);
  });
  it('should return 403 when not owner or admin', (done) => {
    request(app)
      .post('/auth')
      .send(testUser)
      .then((resp) => {
        testToken = resp.body.token;
        request(app)
          .get(`/users/${adminUser.email}`)
          .set('Authorization', `Bearer ${testToken}`)
          .expect('Content-Type', /application\/json/)
          .expect(403, done);
      });
  });
  it('should return 200 and own user by email', (done) => {
    request(app)
      .get(`/users/${testUser.email}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ body }) => {
        expect(body.email).toBe(testUser.email);
        done();
      });
  });
  it('should return 200 and own user by id', (done) => {
    request(app)
      .get(`/users/${idUser}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ body }) => {
        expect(body.email).toBe(testUser.email);
        done();
      });
  });
  it('should return 200 and other user as admin', (done) => {
    request(app)
      .get(`/users/${testUser.email}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ body }) => {
        expect(body.email).toBe(testUser.email);
        done();
      });
  });
});

describe('PUT /users/:uid', () => {
  it('should return 401 when no auth', (done) => {
    request(app)
      .put(`/users/${testUser.email}`)
      .expect('Content-Type', /application\/json/)
      .expect(401, done);
  });
  it('should return 403 when not owner or admin', (done) => {
    request(app)
      .put(`/users/${adminUser.email}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(403, done);
  });
  it('should return 403 when a non-admin user tries to change role', (done) => {
    request(app)
      .put(`/users/${testUser.email}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ roles: { admin: true } })
      .expect('Content-Type', /application\/json/)
      .expect(403, done);
  });
  it('should return 404 when user not found', (done) => {
    request(app)
      .put('/users/test@a.com')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(404, done);
  });
  it('should return 400 when there are no properties in the body', (done) => {
    request(app)
      .put(`/users/${adminUser.email}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(400, done);
  });
  it('should return 400 when email format is wrong', (done) => {
    request(app)
      .put(`/users/${testUser.email}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'test@user' })
      .expect('Content-Type', /application\/json/)
      .expect(400, done);
  });
  it('should return 403 when email is already registered', (done) => {
    request(app)
      .put(`/users/${testUser.email}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'admin@localhost.com' })
      .expect('Content-Type', /application\/json/)
      .expect(403, done);
  });
  it('should return 400 when password format is wrong', (done) => {
    request(app)
      .put(`/users/${testUser.email}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ password: 'As123456' })
      .expect('Content-Type', /application\/json/)
      .expect(400, done);
  });
  it('should return 200 and update user', (done) => {
    request(app)
      .put(`/users/${testUser.email}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'test@user.com', password: 'User@1234', roles: { admin: true } })
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then((response) => {
        testUser.email = 'test@user.com';
        testUser.password = 'User@1234';
        expect(typeof response.body.email).toBe('string');
        expect(typeof response.body._id).toBe('string');
        expect(typeof response.password).toBe('undefined');
        done();
      });
  });
  it('should return 200 and update user', (done) => {
    request(app)
      .put(`/users/${idUser}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'user@test.com', password: 'User@123456' })
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then((response) => {
        testUser.email = 'user@test.com';
        testUser.password = 'User@123456';
        expect(typeof response.body.email).toBe('string');
        expect(typeof response.body._id).toBe('string');
        expect(typeof response.password).toBe('undefined');
        done();
      });
  });
});

describe('DELETE /users/:uid', () => {
  it('should return 401 when no auth', (done) => {
    request(app)
      .delete(`/users/${testUser.email}`)
      .expect('Content-Type', /application\/json/)
      .expect(401, done);
  });
  it('should return 403 when not owner or admin', (done) => {
    request(app)
      .put(`/users/${testUser.email}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ roles: { admin: false } })
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(() => {
        request(app)
          .delete(`/users/${adminUser.email}`)
          .set('Authorization', `Bearer ${testToken}`)
          .expect('Content-Type', /application\/json/)
          .expect(403, done);
      });
  });
  it('should return 404 when user not found', (done) => {
    request(app)
      .delete('/users/test@a.com')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(404, done);
  });
  it('should return 200 and delete user', (done) => {
    request(app)
      .delete(`/users/${idUser}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ body }) => {
        expect(typeof body.email).toBe('string');
        expect(typeof body._id).toBe('string');
        done();
      });
  });
  it('should return 200 and delete user', (done) => {
    request(app)
      .delete('/users/adminTest@test.com')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ body }) => {
        expect(typeof body.email).toBe('string');
        expect(typeof body._id).toBe('string');
        done();
      });
  });
});
