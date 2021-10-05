const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  image: { type: String, default: '' },
  type: { type: String, default: 'General' },
  dateEntry: { type: Date, default: Date.now },
},
{ versionKey: false });

productSchema.plugin(mongoosePaginate);

module.exports = model('Product', productSchema);
