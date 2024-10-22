const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const { uploadSingleImage } = require("../middlewares/uploadImageMiddleWare");
const User = require("../config/models/userModel");
const factory = require("./handlersFactory");

const ApiError = require("../utils/apiError");
const createToken = require("../utils/createToken");
const sendEmail = require("../utils/sendEmail");

const imageFactory = require("../middlewares/imagesMiddleWares");

// upload Single Image
exports.uploadUserImage = uploadSingleImage("image");

// Image Processing
exports.addUserProfileImage = imageFactory.ImageProssing("User", "Users");

exports.updateUserProfileImage = imageFactory.updateImage(
  User,
  "User",
  "Users"
);

// delete image MiddleWare
exports.deleteUserProfileImage = imageFactory.deleteImage(
  User,
  "User",
  "Users"
);

// @desc get Users
// @route PUT /api/v1/users
// access Private/admin
exports.getUsers = factory.getAll(User, "user");

// @desc specific User
// @route GET /api/v1/users/:id
// access Private/admin
exports.getUser = factory.getOne(User);

// @desc Creacte User
// @route POST /api/v1/users
// access Private/admin
exports.createUser = factory.createOne(User);

// @desc UPDATE Users
// @route PUT /api/v1/users/:id
// access Private/admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,

    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
      image: req.body.image,
      role: req.body.role,
    },

    { new: true }
  );

  if (!document) {
    return next(
      new ApiError(`No Document Found For This Id ${req.params.id}`),
      400
    );
  }

  res.status(200).json({ data: document });
});

// @desc Change specific User password
// @route Update /api/v1/users/:id
// access Public/admin/
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  // Hash the new password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Update the user with the new password
  const document = await User.findByIdAndUpdate(
    req.params.id,
    { password: hashedPassword, passwordChangedAt: Date.now() }, // Pass the password field inside an object
    { new: true } // Return the updated document
  );

  // Check if the user exists
  if (!document) {
    return next(
      new ApiError(`No Document Found For This Id ${req.params.id}`, 400)
    );
  }

  res.status(200).json({
    status: "success",
    data: document,
  });
});

// @desc DELETE specific User
// @route DELETE /api/v1/users/:id
// access Private/admin
exports.deleteUser = factory.deleteOne(User);

// @desc DELETE specific User
// @route DELETE /api/v1/users/:id
// access Private/admin
exports.suspendSpecificUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, {
    suspended: true,
  });

  const suspendMessage = `Hi ${user.name},\n\nWe regret to inform you that your account has been suspended due to behavior that violates our community guidelines. If you believe this is a mistake, please contact our support team for further assistance.\n\nThank you.`;

  await sendEmail({
    email: user.email,
    subject: "Your Account has been suspended",
    message: suspendMessage,
  });
  res.status(200).json({
    msg: `The user (username:${user.name}) has been suspended successfully`,
  });
});

exports.unsuspendSpecificUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, {
    suspended: false,
  });

  const reactivationMessage = `Hi ${user.name},\n\nWe are pleased to inform you that your account has been reactivated after reviewing your request. You can now log in and resume using our services. If you have any further questions or concerns, feel free to reach out to our support team.\n\nThank you for your patience and understanding.\n\nBest regards,\nThe Support Team.`;

  await sendEmail({
    email: user.email,
    subject: "Your Account has been suspended",
    message: reactivationMessage,
  });
  res.status(200).json({
    msg: `The user (username:${user.name}) has been suspended successfully`,
  });
});

// @desc get logged User data
// @route GET /api/v1/users/getme
// access Private/protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc update logged User password
// @route PUT /api/v1/users/changemypassword
// access Private/protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Update user password based user payload (req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  // 2) Generate token
  const token = createToken(user._id);

  res.status(200).json({ data: user, token });
});

// @desc update logged User data(without password and role)
// @route PUT /api/v1/users/updatemydata
// access Private/protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      image: req.body.image,
    },
    { new: true }
  );

  res.status(200).json({ data: updatedUser });
});

// @desc update user activation (decactive)
// @route PUT /api/v1/users/deactivation
// access Private/protect
exports.deactivationLoggedUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(200).json({ status: "success", msg: "user deactivation success" });
});
