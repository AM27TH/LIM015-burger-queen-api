/* const request = require('supertest'); */
const { connect } = require('../../database');
/* const app = require('../../app');

const config = require('../../config'); */

beforeAll(() => connect('mongodb://localhost:27017/test'));

/* const adminUser = {
  email: config.adminEmail,
  password: config.adminPassword,
};
let adminToken = null;

const testUser = {
  email: 'user@orders.com',
  password: 'User@1234',
};
let testToken = null; */

describe('POST /orders', () => {
});

describe('GET /orders', () => {
});

describe('GET /orders/:productId', () => {
});

describe('PUT /orders/:productId', () => {
});

describe('DELETE /orders/:productId', () => {
});
