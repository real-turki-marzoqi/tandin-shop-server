const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

const multer = require('multer');
const { uploadMixOfImages } = require("../middlewares/imageUpload");
const ApiError = require('../utils/apiError');
const Product = require('../models/productModel');
const factory = require('./handlersFactory');
const imageFactory = require('../middlewares/imagesMiddleWares')

// Storage
exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 3,
  },
]);

exports.resizeProductImages = imageFactory.resizeProductImages(
  "Product",
  "Products"
);

exports.deleteProductImages = imageFactory.deleteProductCoverImageAndImages(
  Product,
  "Product",
  "Products"
);

exports.updateProductImages = imageFactory.updateProductImages(
  Product,
  "Product",
  "Products"
);


// @desc      Get all products
// @route     GET /api/v1/products
// @access    Public
exports.getProducts = factory.getAll(Product, 'Product');

// @desc      Get specific product by id
// @route     GET /api/v1/products/:id
// @access    Public
exports.getProduct = factory.getOne(Product, 'reviews');

// @desc      Create product
// @route     POST /api/v1/products
// @access    Private
exports.createProduct = factory.createOne(Product);
// @desc      Update product
// @route     PATCH /api/v1/products/:id
// @access    Private
exports.updateProduct = factory.updateOne(Product);

// @desc     Delete product
// @route    DELETE /api/v1/products/:id
// @access   Private
exports.deleteProduct = factory.deleteOne(Product);
