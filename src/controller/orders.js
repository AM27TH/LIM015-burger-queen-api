const Order = require('../models/order');

module.exports = {
  getOrders: async (req, resp, next) => {
    try {
      const orders = await Order.find();
      return resp.json(orders);
    } catch (error) {
      next(error);
    }
  },
  getOrderById: async (req, resp, next) => {
    try {
      const order = await Order.findOne({ _id: req.params.orderId });
      if (!order) return next(404);
      return resp.json(order);
    } catch (error) {
      return next(error);
    }
  },
  addOrder: async (req, resp, next) => {
    try {
      const { userId, client, products } = req.body;
      if (!userId || !client || products.length === 0) return next(400);
      const newOrder = new Order({
        userId, client, products,
      });
      // TODO: Guardar newOrder
      resp.json(newOrder);
    } catch (error) {
      next(error);
    }
  },
  updateOrderById: async (req, resp, next) => {
    try {
      // Validar si existe el producto
      const order = await Order.findOne({ _id: req.params.orderId });
      if (!order) return next(404);
      if (!Object.keys(req.body).length) return next(400);
      const { status } = req.body;
      if (status !== 'pendin' || status !== 'canceled' || status !== 'delivering' || status !== 'delivered') return next(400);
      const updatedOrder = await Order.findByIdAndUpdate(req.params.orderId, req.body, {
        new: true,
      });
      return resp.json(updatedOrder);
    } catch (error) {
      return next(error);
    }
  },
  deleteOrderById: async (req, resp, next) => {
    try {
      const order = await Order.findOneAndDelete({ _id: req.params.orderId });
      if (!order) return next(404);
      return resp.json(order);
    } catch (error) {
      return next(error);
    }
  },
};
