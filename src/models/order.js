const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const orderSchema = new Schema({
  userId: { type: String, required: true },
  client: { type: String, default: '' },
  products: [{
    qty: { type: Number, required: true },
    product: { ref: 'Product', type: Schema.Types.ObjectId, required: true },
  }],
  status: { type: String, required: true, default: 'pendiente' },
  dateEntry: { type: Date, required: true, default: Date.now },
  dateProcessed: { type: Date, default: Date.now },
}, { timestamps: true });

orderSchema.plugin(mongoosePaginate);

module.exports = model('Order', orderSchema);
