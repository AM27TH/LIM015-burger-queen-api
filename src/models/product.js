const { Schema, model } = require('mongoose');

const productSchema = new Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true, default: 0 },
  image: { type: String, required: true },
  type: { type: String, required: true },
  dateEntry: { type: Date, default: Date.now },
},
{ versionKey: false, timestamps: true });

module.exports = model('Product', productSchema);
