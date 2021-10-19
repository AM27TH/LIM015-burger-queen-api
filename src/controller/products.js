const Product = require('../models/product');
const { idValidation } = require('../services/validation');
const { paginate } = require('../services/pagination');

module.exports = {
  getProducts: async (req, resp, next) => {
    try {
      const url = `${req.connection && req.connection.encrypted ? 'https' : 'http'}://${req.headers.host + req.path}`;
      const limit = parseInt(req.query.limit, 10) || 10;
      const page = parseInt(req.query.page, 10) || 1;
      const { type } = req.query;
      let option = {};
      let query = {};
      if (type) {
        query = { type };
        option = { name: 'type', value: type };
      }
      const products = await Product.paginate(query, { limit, page });
      resp.links(
        paginate(url, option, products.limit, products.page, products.totalPages, products),
      );
      return resp.json(products.docs);
    } catch (error) {
      next(error);
    }
  },
  getProductById: async (req, resp, next) => {
    try {
      if (!idValidation(req.params.productId)) return next(404);
      const product = await Product.findOne({ _id: req.params.productId });
      if (!product) return next(404);
      return resp.json(product);
    } catch (error) {
      next(error);
    }
  },
  addProduct: async (req, resp, next) => {
    try {
      const {
        name, price, type, image,
      } = req.body;
      // Validar si existe el producto
      const product = await Product.findOne({ name });
      if (product) return resp.status(404).json({ message: 'Producto ya existe' });
      // Validar campos name y price
      if (!name || !price) return next(400);
      const newProduct = new Product({
        name, price, type, image,
      });
      const productSaved = await newProduct.save();
      return resp.json(productSaved);
    } catch (error) {
      next(error);
    }
  },
  updateProductById: async (req, resp, next) => {
    try {
      if (!idValidation(req.params.productId)) return next(404);
      // Validar si existe el producto
      const product = await Product.findOne({ _id: req.params.productId });
      if (!product) return next(404);
      if (!Object.keys(req.body).length) return next(400);
      const { price } = req.body;
      if (price !== undefined && !parseFloat(price)) return next(400);
      const updatedProduct = await Product.findByIdAndUpdate(req.params.productId, req.body, {
        new: true,
      });
      return resp.json(updatedProduct);
    } catch (error) {
      next(error);
    }
  },
  deleteProductById: async (req, resp, next) => {
    try {
      if (!idValidation(req.params.productId)) return next(404);
      const product = await Product.findOneAndDelete({ _id: req.params.productId });
      if (!product) return next(404);
      return resp.json(product);
    } catch (error) {
      next(error);
    }
  },
};
