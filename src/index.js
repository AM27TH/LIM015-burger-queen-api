require('dotenv').config();
const app = require('./app');
const config = require('./config');
const { connect } = require('./database');

const { port } = config;

async function main() {
  await connect();
  await app.listen(port);
  console.info(`App listening on port ${port}`);
}

main();
