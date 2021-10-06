const request = require('supertest');
const bcrypt = require('bcrypt');
const User = require('../../models/user');
const { connect, close } = require('../../database');
const app = require('../../app');

const adminUser = {
  email: 'products@test.com',
  password: 'Products@test123',
};
let adminToken = null;

const testUser = {
  email: 'user@products.com', password: 'User@test123',
};
let testToken = null;

beforeAll(async () => {
  await connect('mongodb://localhost:27017/BQproducts');
  // Agregar admin
  const addUser = (user, admin = false) => User.findOne({ email: user.email })
    .then(async (doc) => {
      // Crear usuario
      const adminAuth = new User({
        email: user.email,
        password: bcrypt.hashSync(user.password, 10),
        roles: { admin },
      });
      if (!doc) await adminAuth.save();
    });
  await addUser(adminUser, true);
  await addUser(testUser);
});

afterAll(async () => {
  await close();
});

const product = { name: 'Bebida', price: 5, _id: '' };
const productUpdate = { name: 'Hamburguesa', price: 5, _id: '' };

describe('POST /products', () => {
  it('should return 401 when no auth', (done) => {
    request(app)
      .post('/products')
      .expect('Content-Type', /application\/json/)
      .expect(401, done);
  });
  it('should return 403 when no admin', (done) => {
    request(app).post('/auth').send(testUser)
      .expect(200)
      .then((res) => {
        testToken = res.body.token;
        request(app)
          .post('/products')
          .set('Authorization', `Bearer ${testToken}`)
          .expect('Content-Type', /application\/json/)
          .expect(403, done);
      });
  });
  it('should return 400 when name or price no exits', (done) => {
    request(app).post('/auth').send(adminUser)
      .expect(200)
      .then((res) => {
        adminToken = res.body.token;
        request(app)
          .post('/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect('Content-Type', /application\/json/)
          .expect(400, done);
      });
  });
  it('should return 200 and create product as admin', (done) => {
    request(app)
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: product.name, price: product.price })
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ body }) => {
        product._id = body._id;
        expect(typeof body._id).toBe('string');
        expect(body.name).toBe(product.name);
        expect(body.type).toBe('General');
        expect(body.price).toBe(product.price);
        expect(body.image).toBe('');
        done();
      });
  });
  it('should return 404 when product exits', (done) => {
    request(app)
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: product.name })
      .expect('Content-Type', /application\/json/)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('Producto ya existe');
        done();
      });
  });
});

describe('GET /products', () => {
  it('should return 401 when no auth', (done) => {
    request(app)
      .get('/products')
      .expect('Content-Type', /application\/json/)
      .expect(401, done);
  });
  it('should return 200 and list of products', (done) => {
    request(app)
      .get('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ headers, body }) => {
        expect(headers.link).toBeTruthy();
        expect(Array.isArray(body)).toBe(true);
        done();
      });
  });
});

describe('GET /products/:productId', () => {
  it('should return 404 when is an invalid Id', (done) => {
    request(app)
      .get('/products/productid')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(404, done);
  });
  it('should return 404 when product not found', (done) => {
    request(app)
      .get('/products/615aa06c362c0d627b2e6ae3')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(404, done);
  });
  it('should return 200 and product', (done) => {
    request(app)
      .get(`/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ body }) => {
        expect(typeof body._id).toBe('string');
        expect(body.name).toBe(product.name);
        expect(body.type).toBe('General');
        expect(body.price).toBe(product.price);
        expect(body.image).toBe('');
        done();
      });
  });
});

describe('PUT /products/:productId', () => {
  it('should return 404 when is an invalid Id', (done) => {
    request(app)
      .put('/products/productid')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(404, done);
  });
  it('should return 404 when product not found', (done) => {
    request(app)
      .put('/products/615aa06c362c0d627b2e6ae3')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(404, done);
  });
  it('should return 400 when there are no properties in the body', (done) => {
    request(app)
      .put(`/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(400, done);
  });
  it('should return 400 when price is not number', (done) => {
    request(app)
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: productUpdate.name, price: productUpdate.price })
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ body }) => {
        productUpdate._id = body._id;
        request(app)
          .put(`/products/${productUpdate._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ price: product.name })
          .expect('Content-Type', /application\/json/)
          .expect(400, done);
      });
  });
  it('should return 200 and update product', (done) => {
    request(app)
      .put(`/products/${productUpdate._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 7 })
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ body }) => {
        productUpdate.price = 7;
        expect(body.name).toBe(productUpdate.name);
        expect(body.price).toBe(productUpdate.price);
        done();
      });
  });
});

describe('DELETE /products/:productId', () => {
  it('should return 404 when is an invalid Id', (done) => {
    request(app)
      .delete('/products/productid')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(404, done);
  });
  it('should return 404 when product no exits', (done) => {
    request(app)
      .delete('/products/615c6f8da26dd7697eef3794')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(404, done);
  });
  it('should return 200 and delete product', (done) => {
    request(app)
      .delete(`/products/${productUpdate._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ body }) => {
        expect(body.name).toBe(productUpdate.name);
        expect(body.price).toBe(productUpdate.price);
        done();
      });
  });
});
