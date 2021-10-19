const Order = require('../models/order');
const { idValidation } = require('../services/validation');
const { paginate } = require('../services/pagination');

module.exports = {
  getOrders: async (req, resp, next) => {
    try {
      const url = `${req.connection && req.connection.encrypted ? 'https' : 'http'}://${req.headers.host + req.path}`;
      const limit = parseInt(req.query.limit, 10) || 10;
      const page = parseInt(req.query.page, 10) || 1;
      const { status } = req.query;
      let option = {};
      let query = {};
      if (status) {
        query = { status };
        option = { name: 'status', value: status };
      }
      const orders = await Order.paginate(query, {
        limit, page, sort: { dateEntry: 1 }, populate: 'products.product',
      });
      resp.links(paginate(url, option, orders.limit, orders.page, orders.totalPages, orders));
      return resp.json(orders.docs);
    } catch (error) {
      next(error);
    }
  },
  getOrderById: async (req, resp, next) => {
    try {
      if (!idValidation(req.params.orderId)) return next(404);
      const order = await Order.findOne({ _id: req.params.orderId }).populate('products.product');
      if (!order) return next(404);
      return resp.json(order);
    } catch (error) {
      next(error);
    }
  },
  addOrder: async (req, resp, next) => {
    try {
      const { userId, client, products } = req.body;
      if (!userId || products.length === 0) return next(400);
      const newOrder = new Order({
        userId,
        client,
        products: products.map((product) => ({
          qty: product.qty,
          product: product.productId,
        })),
      });
      await newOrder.save();
      const currentOrder = await newOrder.populate('products.product');
      resp.json(currentOrder);
    } catch (error) {
      next(error);
    }
  },
  updateOrderById: async (req, resp, next) => {
    try {
      if (!idValidation(req.params.orderId)) return next(404);
      // Validar si existe el producto
      const order = await Order.findOne({ _id: req.params.orderId });
      if (!order) return next(404);
      if (!Object.keys(req.body).length) return next(400);
      const {
        userId, client, products, status,
      } = req.body;
      // Validación de status
      const validStatus = [
        'pendiente', 'cancelado', 'listo', 'entregado', 'preparando',
      ];
      if (status) {
        if (!validStatus.includes(status)) return resp.status(400).json({ message: 'Estado inválido' });
      }
      if (status === 'entregado') order.dateProcessed = Date.now();
      // Validación de otros campos
      if (userId) order.userId = userId;
      if (client) order.client = client;
      if (status) order.status = status;
      if (products) {
        order.products = products.map((product) => ({
          qty: product.qty, product: product.productId,
        }));
      }
      await order.save();
      return resp.json(order);
    } catch (error) {
      next(error);
    }
  },
  deleteOrderById: async (req, resp, next) => {
    try {
      if (!idValidation(req.params.orderId)) return next(404);
      const order = await Order.findOneAndDelete({ _id: req.params.orderId });
      if (!order) return next(404);
      return resp.json(order);
    } catch (error) {
      next(error);
    }
  },
};
