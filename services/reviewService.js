const Review = require("../config/models/reviewModel");
const factory = require("./handlersFactory");

// nested route
// GET /api/v1/products/:productId/reviews
exports.createFilterObject = (req, res, next) => {
  let filterObject = {};

  if (req.params.productId) {
    filterObject = { product: req.params.productId };
  }

  req.filterObject = filterObject;
  next();
};

// @desc get list of reviews
// @route POST /api/v1/reviews
// access public
exports.getReviews = factory.getAll(Review, "review");

// @desc GET Specific Review By ID
// @route GET /api/v1/reviews/:id
// access Public
exports.getReview = factory.getOne(Review);

// nasted routes(create)
// POST /api/v1/categories/:categoryId/subcategories
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  
    if (!req.body.product) req.body.product = req.params.productId;
  
   
    if (!req.body.user) req.body.user = req.user._id;
  
    next();
  };
  
// @desc Create Review
// @route Post /api/v1/reviews
// access Private/protect/user
exports.createReview = factory.createOne(Review);

// @desc Update Specific Review
// @route PUT /api/v1/reviews/:id
// access Private/protect/user
exports.updateReview = factory.updateOne(Review);

// @desc DELETE Specific Review
// @route DELETE /api/v1/reviews/:id
// access Private/protect/user-admin-maneger
exports.deleteReview = factory.deleteOne(Review);
