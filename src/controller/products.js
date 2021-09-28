const Product = require('../models/product');
const { idValidation } = require('../services/validation');
const { paginate } = require('../services/pagination');

module.exports = {
  getProducts: async (req, resp, next) => {
    try {
      const url = `${req.protocol}://${req.headers.host + req.path}`;
      const limit = parseInt(req.query.limit, 10) || 10;
      const page = parseInt(req.query.page, 10) || 1;
      const products = await Product.paginate({}, { limit, page });
      resp.links(paginate(url, products.limit, products.page, products.totalPages, products));
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
      return next(error);
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
      if (Object.entries(req.body).length === 0) return next(400);
      // Validar campos name y price
      if (!name || !price) return next(400);
      const newProduct = new Product({ name, price });
      if (type) newProduct.type = type;
      if (image) newProduct.image = image;
      const productSaved = await newProduct.save();
      return resp.json(productSaved);
    } catch (error) {
      return next(error);
    }
  },
  updateProductById: async (req, resp, next) => {
    try {
      if (!idValidation(req.params.productId)) return next(404);
      // Validar si existe el producto
      const product = await Product.findOne({ _id: req.params.productId });
      if (!product) return next(404);
      if (!Object.keys(req.body).length) return next(400);
      const { name, price } = req.body;
      // Validar si nombre nuevo ya existe
      if (name) {
        const productName = await Product.findOne({ name });
        if (productName) return resp.status(400).json({ message: 'Ese nombre de producto ya existe' });
      }
      if (!parseFloat(price)) return next(400);
      const updatedProduct = await Product.findByIdAndUpdate(req.params.productId, req.body, {
        new: true,
      });
      return resp.json(updatedProduct);
    } catch (error) {
      return next(error);
    }
  },
  deleteProductById: async (req, resp, next) => {
    try {
      if (!idValidation(req.params.productId)) return next(404);
      const product = await Product.findOneAndDelete({ _id: req.params.productId });
      if (!product) return next(404);
      return resp.json(product);
    } catch (error) {
      return next(error);
    }
  },
};
