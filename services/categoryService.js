const multer = require("multer");
const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const Category = require("../config/models/categoryModel");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleWare");
const imageFactory = require('../middlewares/imagesMiddleWares')


// upload Single Image
exports.uploadCategoryImage = uploadSingleImage("image");



// Image Processing
exports.categoryImageProssing =imageFactory.ImageProssing('Category','Categories')

// delete image MiddleWare
exports.deleteCategoryImage = imageFactory.deleteImage(Category, 'Category', 'Categories');

exports.updateCategoryImage = imageFactory.updateImage(Category, 'Category', 'Categories')

// @desc get list of categories
// @route GET /api/v1/categories
// access Public
exports.getCategories = factory.getAll(Category, "Category");

// @desc GET Specific Category By ID
// @route GET /api/v1/categories/:id
// access Public
exports.getCategory = factory.getOne(Category);

// @desc Create Category
// @route Post /api/v1/categories
// access Public
exports.createCategory = factory.createOne(Category);

// @desc Update Specific category
// @route PUT /api/v1/categories/:id
// access Private/admin/maneger
exports.updateCategory = factory.updateOne(Category);

// @desc DELETE Specific Category
// @route DELETE /api/v1/categories/:id
// access Private/admin
exports.deleteCategory = factory.deleteOne(Category);
