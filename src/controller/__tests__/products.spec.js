const request = require('supertest');
const { connect } = require('../../database');
const app = require('../../app');

const config = require('../../config');

beforeAll(async () => {
  await connect('mongodb://localhost:27017/test');
});

const adminUser = {
  email: config.adminEmail,
  password: config.adminPassword,
};
let adminToken = null;

const product = { name: 'Bebida', price: 5, _id: '' };
const productUpdate = { name: 'Hamburguesa', price: 5, _id: '' };

describe('POST /products', () => {
  it('should return 400 when name or price no exits', (done) => {
    console.info('otro');
    request(app)
      .post('/auth')
      .send(adminUser)
      .expect(200)
      .then((resp) => {
        adminToken = resp.body.token;
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
  it('should return 200 and list of products', (done) => {
    request(app)
      .get('/products')
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
  it('should return 400 when name exits', (done) => {
    request(app)
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: productUpdate.name, price: productUpdate.price })
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(({ body }) => {
        productUpdate._id = body._id;
        request(app)
          .put(`/products/${body._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: productUpdate.name })
          .expect('Content-Type', /application\/json/)
          .expect(400, done);
      });
  });
});

describe('DELETE /products/:productId', () => {
});
