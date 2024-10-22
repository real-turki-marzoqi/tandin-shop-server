const asyncHandler = require("express-async-handler");
const Coupon = require("../config/models/couponModel");
const factory = require("./handlersFactory");



// @desc get list of Coupons
// @route GET /api/v1/coupons
// access Private/admin-maneger
exports.getCoupons = factory.getAll(Coupon, "Coupon");

// @desc GET Specific Coupon By ID
// @route GET /api/v1/coupons/:id
// access Private/admin-maneger
exports.getCoupon = factory.getOne(Coupon);

// @desc Create Coupon
// @route Post /api/v1/coupons
// access Private/admin-maneger
exports.createCoupon = factory.createOne(Coupon);

// @desc Update Specific Coupon
// @route PUT /api/v1/coupons/:id
// access Private/admin-maneger
exports.updateCoupon= factory.updateOne(Coupon);

// @desc DELETE Specific Coupon
// @route DELETE /api/v1/coupons/:id
// access Private/admin-maneger
exports.deleteCoupon= factory.deleteOne(Coupon);
