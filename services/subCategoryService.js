const SubCategory = require("../config/models/subCategoryModel");
const factory = require("./handlersFactory");

// nasted route
// GET /api/v1/categories/:categoryId/subcatagories
exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };

  req.filterObject = filterObject;
  next();
};

// nasted routes(create)
// POST /api/v1/categories/:categoryId/subcategories
exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// @desc get list of subCategories
// @route GET /api/v1/subcategories
// access Public
exports.getSubCategorise = factory.getAll(SubCategory, "SubCategory");

// @desc GET Specific SubCategory By ID
// @route GET /api/v1/subcategories/:id
// access Public
exports.getSubCategory = factory.getOne(SubCategory);

// @desc Create SubCategory
// @route Post /api/v1/subcategories
// access Public
exports.creatSubCategory = factory.createOne(SubCategory);

// @desc Update Specific SubCategory
// @route PUT /api/v1/subcategories/:id
// access Private/admin/maneger
exports.updateSubCategory = factory.updateOne(SubCategory);

// @desc DELETE Specific SubCategory
// @route DELETE /api/v1/subcategories/:id
// access Private/admin
exports.deleteSubCategory = factory.deleteOne(SubCategory);
