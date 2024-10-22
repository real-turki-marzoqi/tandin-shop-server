const { uploadSingleImage } = require("../middlewares/uploadImageMiddleWare");
const Brand = require("../config/models/brandModel");
const factory = require("./handlersFactory");
const imageFactory = require('../middlewares/imagesMiddleWares')



// upload Single Image
exports.uploadBrandImage = uploadSingleImage("image");

// Image Processing
exports.brandeImageProssing =imageFactory.ImageProssing('Brand','Brands')

//
exports.updateBrandImage = imageFactory.updateImage(Brand, 'Brand', 'Brands')

// delete image MiddleWare
exports.deleteBrandImage = imageFactory.deleteImage(Brand, 'Brand', 'Brands');

// @desc get list of BRANDS
// @route POST /api/v1/brands
// access public
exports.getBrands = factory.getAll(Brand, "name");

// @desc GET Specific BRAND By ID
// @route GET /api/v1/brands/:id
// access Public
exports.getBrand = factory.getOne(Brand);

// @desc Create brand
// @route Post /api/v1/brands
// access Public
exports.createBrand = factory.createOne(Brand);

// @desc Update Specific Brand
// @route PUT /api/v1/brands/:id
// access Private/admin/maneger
exports.updateBrand = factory.updateOne(Brand);

// @desc DELETE Specific BRAND
// @route DELETE /api/v1/brands/:id
// access Private/admin
exports.deleteBrand = factory.deleteOne(Brand);
