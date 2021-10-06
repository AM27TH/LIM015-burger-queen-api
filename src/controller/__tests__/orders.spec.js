const request = require('supertest');
const bcrypt = require('bcrypt');
const User = require('../../models/user');
const Product = require('../../models/product');
const { connect, close } = require('../../database');
const app = require('../../app');

const adminUser = { email: 'orders@test.com', password: 'Orders@test123', _id: '' };
let adminToken = null;

const testUser = { email: 'user@orders.com', password: 'User@test123', _id: '' };

const product1 = { name: 'Hamburguesa', price: 5, _id: '' };

const orderOne = {
  userId: '',
  client: '',
  products: [
    { qty: 0, productId: '' },
  ],
};
let orderOneId = null;

beforeAll(async () => {
  await connect('mongodb://localhost:27017/BQorders');
  // Agregar admin
  const addUser = (user, admin = false) => User.findOne({ email: user.email })
    .then(async (doc) => {
      // Crear usuario
      const auth = new User({
        email: user.email,
        password: bcrypt.hashSync(user.password, 10),
        roles: { admin },
      });
      // eslint-disable-next-line no-param-reassign
      user._id = auth._id.toString();
      if (!doc) await auth.save();
    });
  await addUser(adminUser, true);
  await addUser(testUser);
  const addProduct = async (product) => {
    const newProduct = new Product({ name: product.name, price: product.price });
    // eslint-disable-next-line no-param-reassign
    product._id = newProduct._id.toString();
    await newProduct.save();
  };
  await addProduct(product1);
  orderOne.userId = testUser._id;
  orderOne.client = 'client';
  orderOne.products = [
    { qty: 2, productId: product1._id },
  ];
});

afterAll(async () => {
  await close();
});

describe('POST /orders', () => {
  it('should return 400 when there are no proerties', (done) => {
    request(app)
      .post('/auth')
      .send({ email: adminUser.email, password: adminUser.password })
      .expect(200)
      .then((resp) => {
        adminToken = resp.body.token;
        request(app)
          .post('/orders')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect('Content-Type', /application\/json/)
          .expect(400, done);
      });
  });
  it('should return 401 when no auth', (done) => {
    request(app)
      .post('/orders')
      .expect('Content-Type', /application\/json/)
      .expect(401, done);
  });
  it('should return 200 and create order', (done) => {
    request(app)
      .post('/orders')
      .send(orderOne)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ body }) => {
        orderOneId = body._id;
        expect(body.client).toBeTruthy();
        expect(body.products).toBeTruthy();
        expect(body._id).toBeTruthy();
        done();
      });
  });
});

describe('GET /orders', () => {
  it('should return 401 when no auth', (done) => {
    request(app)
      .get('/orders')
      .expect('Content-Type', /application\/json/)
      .expect(401, done);
  });
  it('should return 200 when no auth', (done) => {
    request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ headers, body }) => {
        expect(headers.link).toBeTruthy();
        expect(body.length > 0).toBe(true);
        expect(Array.isArray(body)).toBe(true);
        done();
      });
  });
});

describe('GET /orders/:productId', () => {
  it('should return 401 when no auth', (done) => {
    request(app)
      .get('/orders/orders')
      .expect('Content-Type', /application\/json/)
      .expect(401, done);
  });
  it('should return 404 when id format is wrong', (done) => {
    request(app)
      .get('/orders/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(404, done);
  });
  it('should return 404 when order no exits', (done) => {
    request(app)
      .get(`/orders/${testUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(404, done);
  });
  it('should return 200 and order', (done) => {
    request(app)
      .get(`/orders/${orderOneId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ body }) => {
        expect(body.userId).toBe(orderOne.userId);
        expect(body.client).toBe(orderOne.client);
        expect(Array.isArray(body.products)).toBe(true);
        done();
      });
  });
});

describe('PUT /orders/:productId', () => {
  it('should return 404 when id format is wrong', (done) => {
    request(app)
      .put('/orders/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(404, done);
  });
  it('should return 404 when order no exits', (done) => {
    request(app)
      .put(`/orders/${testUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(404, done);
  });
  it('should return 400 when there are no proerties', (done) => {
    request(app)
      .put(`/orders/${orderOneId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(400, done);
  });
  it('should return 400 when status is wrong', (done) => {
    request(app)
      .put(`/orders/${orderOneId}`)
      .send({ status: 'cancel' })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(400, done);
  });
  it('should return 200 and update products in order', (done) => {
    request(app)
      .put(`/orders/${orderOneId}`)
      .send({ userId: adminUser._id, client: 'Cliente', products: [{ qty: 6, productId: product1._id }] })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ body }) => {
        expect(body._id).toBeTruthy();
        expect(body.client).toBeTruthy();
        expect(body.products).toBeTruthy();
        expect(body.products[0].product).toBe(product1._id);
        expect(body.products[0].qty).toBe(6);
        expect(body.status).toBe('pending');
        done();
      });
  });
  it('should return 200 and update status', (done) => {
    request(app)
      .put(`/orders/${orderOneId}`)
      .send({ status: 'delivered' })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ body }) => {
        expect(body.dateProcessed).toBeTruthy();
        expect(body._id).toBeTruthy();
        expect(body.client).toBeTruthy();
        expect(body.products).toBeTruthy();
        expect(body.status).toBe('delivered');
        done();
      });
  });
});

describe('DELETE /orders/:productId', () => {
  it('should return 401 when no auth', (done) => {
    request(app)
      .delete('/orders/orders')
      .expect('Content-Type', /application\/json/)
      .expect(401, done);
  });
  it('should return 404 when id format is wrong', (done) => {
    request(app)
      .delete('/orders/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(404, done);
  });
  it('should return 404 when order no exits', (done) => {
    request(app)
      .delete(`/orders/${testUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(404, done);
  });
  it('should return 200 and delete order', (done) => {
    request(app)
      .delete(`/orders/${orderOneId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(200, done);
  });
});
