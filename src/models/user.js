/* eslint-disable no-param-reassign */
const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: { admin: { type: Boolean, required: true } },
},
{ versionKey: false, timestamps: true });

userSchema.statics.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

userSchema.statics.matchPassword = async (password, receivedPassword) => {
  const comparedPassword = await bcrypt.compare(password, receivedPassword);
  return comparedPassword;
};

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.password;
    delete returnedObject.createdAt;
    delete returnedObject.updatedAt;
  },
});

userSchema.plugin(mongoosePaginate);

module.exports = model('User', userSchema);
