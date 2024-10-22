const asyncHandler = require("express-async-handler");
const User = require("../config/models/userModel");

// @desc Add Adress
// @route Post /api/v1/adresses
// access Public/protect/user
exports.addAdress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { adresses: req.body },
    },
    { new: true }
  );

  res
    .status(200)
    .json({ message: "Adresses Added Successfully", data: user.adresses });
});

// @desc Remove adress
// @route DELETE /api/v1/adresses/:adressId
// access Public/protect/user
exports.removeAdress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { adresses: { _id: req.params.adressId } },
    },
    { new: true }
  );

  res.status(200).json({
    message: "Address Removed Successfully",
    data: user.adresses,
  });
});

// @desc    Get logged user Adresses
// @route   GET /api/v1/adresses
// @access  Protected/User
exports.getLoggedUserAdresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("adresses");

  res.status(200).json({
    status: "success",
    results: user.adresses.length,
    data: user.adresses,
  });
});

// @desc Update Address
// @route PUT /api/v1/adresses/:adressId
// @access Protected/User
exports.updateAdress = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user._id) {
    return res.status(400).json({ message: "User not authenticated" });
  }

  const updateFields = {};
  Object.keys(req.body).forEach((key) => {
    updateFields[`adresses.$.${key}`] = req.body[key];
  });

  // تحديث الحقول المطلوبة فقط دون المساس بباقي الحقول
  const user = await User.findOneAndUpdate(
    { _id: req.user._id, "adresses._id": req.params.adressId },
    {
      $set: updateFields,
    },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ message: "User or Address not found" });
  }

  res.status(200).json({
    message: "Address Updated Successfully",
    data: user.adresses,
  });
});


// @desc    Get specific address by ID
// @route   GET /api/v1/adresses/:adressId
// @access  Protected/User
exports.getAddressById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const address = user.adresses.id(req.params.adressId);

  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }

  res.status(200).json({
    status: "success",
    data: address,
  });
});


