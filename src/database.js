const mongoose = require('mongoose');
const config = require('./config');

mongoose
  .connect(config.dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((error) => console.error(error));

mongoose.connection.once('open', () => console.info('Db conectada', config.dbUrl));

mongoose.connection.on('error', (error) => console.error(error));
