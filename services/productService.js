const Product = require("../config/models/productModel");
const factory = require("./handlersFactory");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleWare");
const imageFactory = require("../middlewares/imagesMiddleWares");

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

// @desc get list of products
// @route GET /api/v1/products
// access Public
exports.getProducts = factory.getAll(Product, "Product");

// @desc GET Specific product By ID
// @route GET /api/v1/products/:id
// access Public
exports.getProduct = factory.getOne(Product, "reviews");

// @desc Create product
// @route Post /api/v1/products
// access Public
exports.createProduct = factory.createOne(Product);

// @desc Update Specific product
// @route PUT /api/v1/products/:id
// access Private/admin/maneger
exports.updateProduct = factory.updateOne(Product);

// @desc DELETE Specific products
// @route DELETE /api/v1/products/:id
// access Private/admin
exports.deleteProduct = factory.deleteOne(Product);
