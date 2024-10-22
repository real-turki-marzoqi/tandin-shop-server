const sharp = require('sharp'); // image processing lib for nodejs
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

const factory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlewares/imageUpload');
const Category = require('../models/categoryModel');
const imageFactory = require('../middlewares/imagesMiddleWares')


// upload Single Image
exports.uploadCategoryImage = uploadSingleImage("image");



// Image Processing
exports.categoryImageProssing =imageFactory.ImageProcessing('Category','Categories')

// delete image MiddleWare
exports.deleteCategoryImage = imageFactory.deleteImage(Category, 'Category', 'Categories');

exports.updateCategoryImage = imageFactory.updateImage(Category, 'Category', 'Categories')

// @desc      Get all categories
// @route     GET /api/v1/categories
// @access    Public
exports.getCategories = factory.getAll(Category);

// @desc      Get specific category by id
// @route     GET /api/v1/categories/:id
// @access    Public
exports.getCategory = factory.getOne(Category);

// @desc      Create category
// @route     POST /api/v1/categories
// @access    Private
exports.createCategory = factory.createOne(Category);

// @desc      Update category
// @route     PATCH /api/v1/categories/:id
// @access    Private
exports.updateCategory = factory.updateOne(Category);

// @desc     Delete category
// @route    DELETE /api/v1/categories/:id
// @access   Private
exports.deleteCategory = factory.deleteOne(Category);

exports.deleteAll = factory.deleteAll(Category);
