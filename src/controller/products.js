const Product = require('../models/product');

module.exports = {
  getProducts: async (req, resp, next) => {
    try {
      const products = await Product.find();
      return resp.json(products);
    } catch (error) {
      next(error);
    }
  },
  getProductById: async (req, resp, next) => {
    try {
      const product = await Product.findById(req.params.productId);
      if (!product) return next(404);
      resp.status(200).json(product);
    } catch (error) {
      return next(error);
    }
  },
  addProduct: async (req, resp, next) => {
    try {
      const {
        name, type, price, image,
      } = req.body;
      if (name === '' && price === '') return next(400);
      const newProduct = new Product({
        name, type, price, image,
      });
      const productSaved = await newProduct.save();
      return resp.status(201).json(productSaved);
    } catch (error) {
      return next(error);
    }
  },
  updateProductById: async (req, resp, next) => {
    try {
      if (Object.entries(req.params.body).length === 0) return next(400);
      const updateProduct = await Product.findByIdAndUpdate(req.params.productId, req.body,
        { new: true });
      if (!updateProduct) return next(404);
      return resp.status(200).json(updateProduct);
    } catch (error) {
      return next(error);
    }
  },
  deleteProductById: async (req, resp, next) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.productId);
      if (!product) return next(404);
      return resp.status(204).json(product);
    } catch (error) {
      return next(error);
    }
  },
};
