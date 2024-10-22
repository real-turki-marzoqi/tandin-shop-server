const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

const factory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlewares/imageUpload');
const Brand = require('../models/brandModel');
const imageFactory = require('../middlewares/imagesMiddleWares')


// upload Single Image
exports.uploadBrandImage = uploadSingleImage("image");

// Image Processing
exports.brandeImageProssing =imageFactory.ImageProcessing('Brand','Brands')

//
exports.updateBrandImage = imageFactory.updateImage(Brand, 'Brand', 'Brands')

// delete image MiddleWare
exports.deleteBrandImage = imageFactory.deleteImage(Brand, 'Brand', 'Brands');

// @desc      Get all brands
// @route     GET /api/v1/brands
// @access    Public
exports.getBrands = factory.getAll(Brand);

// @desc      Get specific brand by id
// @route     GET /api/v1/brands/:id
// @access    Public
exports.getBrand = factory.getOne(Brand);
// @desc      Create brand
// @route     POST /api/v1/brands
// @access    Private
exports.createBrand = factory.createOne(Brand);

// @desc      Update brand
// @route     PATCH /api/v1/brands/:id
// @access    Private
exports.updateBrand = factory.updateOne(Brand);

// @desc     Delete brand
// @route    DELETE /api/v1/brands/:id
// @access   Private
exports.deleteBrand = factory.deleteOne(Brand);

exports.deleteAll = factory.deleteAll(Brand);
