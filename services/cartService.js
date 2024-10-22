const asyncHandler = require("express-async-handler");

const Cart = require("../config/models/cartModel");
const Product = require("../config/models/productModel");
const ApiError = require("../utils/apiError");
const Coupon = require('../config/models/couponModel')

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;

  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalCartPriceAfterDiscount = undefined

  return totalPrice;
};

// @desc Add product to cart
// @route POST /api/v1/cart
// access Private/user
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  // 1) Get Cart For Logged User
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // create cart for logged user with product
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    // product exist in cart, update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) =>
        item.product.toString() === String(productId) && item.color === color
    );

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }

  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Get Logged User cart
// @route GET /api/v1/cart
// access Private/user
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError("There is no cart found", 404));
  }

  res.status(200).json({
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Remove Specific Cart Item
// @route DELETE /api/v1/cart/:itemId
// access Private/user
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );

  if (!cart) {
    return next(new ApiError("No cart found for this user", 404));
  }

  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Clear Cart
// @route DELETE /api/v1/cart/
// access Private/user
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(204).send();
});

exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  // 1. البحث عن عربة المستخدم
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`There is no cart found for this user ${req.user._id}`, 404)
    );
  }

  // 2. البحث عن العنصر داخل العربة باستخدام item_id
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (itemIndex > -1) {
    // 3. تحديث الكمية
    cart.cartItems[itemIndex].quantity = quantity;
  } else {
    return next(
      new ApiError(`There is no item found for this id ${req.params.item_id}`, 404)
    );
  }

  // 4. إعادة حساب إجمالي سعر العربة بعد التحديث
  calcTotalCartPrice(cart);

  // 5. حفظ التعديلات
  await cart.save();

  // 6. إعادة الاستجابة
  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1. البحث عن القسيمة والتأكد من صلاحيتها
  const coupon = await Coupon.findOne({
    name: req.body.coupon, 
    expirationDate: { $gt: Date.now() }
  });

  if (!coupon) {
    return next(new ApiError(`Invalid or expired coupon`, 400));
  }

  // 2. البحث عن عربة المستخدم
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError(`There is no cart found for this user`, 404));
  }

  // 3. التأكد من أن العربة تحتوي على منتجات
  if (cart.cartItems.length === 0) {
    return next(new ApiError(`Your cart is empty`, 400));
  }

  // 4. حساب السعر الإجمالي بعد الخصم
  const totalPrice = cart.totalCartPrice;
  const totalPriceAfterDiscount = parseFloat(
    (totalPrice - (totalPrice * coupon.discount) / 100).toFixed(2)
  );

  // 5. تحديث سعر العربة بعد الخصم
  cart.totalCartPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  // 6. إرسال الاستجابة للمستخدم
  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

