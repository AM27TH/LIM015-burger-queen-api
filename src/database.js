const mongoose = require('mongoose');
const config = require('./config');

const connect = (url = config.dbUrl) => {
  mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((error) => console.error(error));
  mongoose.connection.once('open', () => console.info('Db conectada', url));
  mongoose.connection.on('error', (error) => console.error(error));
};

const close = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

module.exports = {
  connect, close,
};
