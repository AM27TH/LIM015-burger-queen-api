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
        name, type, price, image,
      } = req.body;
      // Validar si existe el producto
      const product = await Product.findOne({ name });
      if (product) return resp.status(404).json({ message: 'Producto ya existe' });
      // Validar campos name y price
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
      // Validar si existe el producto
      const product = await Product.findOne({ _id: req.params.productId });
      if (!product) return next(404);
      if (!Object.keys(req.body).length) return next(400);
      const { name } = req.body;
      // Validar si nombre nuevo ya existe
      if (name) {
        const productName = await Product.findOne({ name });
        if (productName) return resp.status(400).json({ message: 'Ese nombre de producto ya existe' });
      }
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
      const product = await Product.findOneAndDelete({ _id: req.params.productId });
      if (!product) return next(404);
      return resp.json(product);
    } catch (error) {
      return next(error);
    }
  },
};
