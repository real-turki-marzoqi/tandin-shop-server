const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const User = require("../config/models/userModel");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");
const ChecksuspendedAccount = require("../utils/suspendedAccount");

// @desc SignUp
// @route GET /api/v1/auth/signup
// access Public
exports.signUp = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    slug: req.body.slug,
  });
  const token = createToken(user._id);

  const SignUpMessage = `Hi ${user.name},\n\nThank you for signing up! We appreciate your interest and welcome you to E-Shop community.\n\nBest regards.`;

  await sendEmail({
    email: user.email,
    subject: "Your Account has been suspended",
    message: SignUpMessage,
  });

  res.status(201).json({ data: user, token });
});

// @desc Login
// @route GET /api/v1/auth/login
// access Public
exports.logIn = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }
  user.active = true;

  user.save();
  const token = createToken(user._id);

  res.status(200).json({ data: user, token });
});

//@desc make sure the user logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) check if token exist , if exist get it

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError(
        "You are not loged,please login to get access this route",
        401
      )
    );
  }
  // 2) verfiy token (no chane happens , no wxpired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) check if user exists

  const currenUser = await User.findById(decoded.userId);

  if (!currenUser) {
    return next(
      new ApiError("The user that belongs to this token no longer exists", 401)
    );
  }

  if (currenUser.active === false) {
    return next(
      new ApiError(
        "This user not Active Please Login To activation this User Account",
        401
      )
    );
  }
  ChecksuspendedAccount(currenUser, next);

  // 4) check if user changed his password after token created

  if (currenUser && currenUser.passwordChangedAt) {
    const passwordChangeTimesTamp = parseInt(
      currenUser.passwordChangedAt.getTime() / 1000,
      10
    );

    if (passwordChangeTimesTamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed his password ,please log in again ...",
          401
        )
      );
    }
  }
  req.user = currenUser;
  next();
});

// @decs Athorization (User Permissions)
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    //1)access role

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("This user not allowed to accesse this route", 401)
      );
    }

    next();

    //2)access registered user(user.req.role)
  });

// @desc forgort Password
// @route GET /api/v1/auth/forgotpassword
// access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) الحصول على المستخدم باستخدام البريد الإلكتروني
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ApiError(`There is no user with this email: ${req.body.email}`, 404)
    );
  }

  ChecksuspendedAccount(user, next);

  // 3) إنشاء رمز إعادة تعيين مكون من 6 أرقام
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 4) تشفير رمز إعادة التعيين
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // 5) حفظ الرمز المشفر في قاعدة البيانات
  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // انتهاء الصلاحية بعد 10 دقائق
  user.passwordResetVerified = false;

  await user.save();

  // 6) إرسال رمز إعادة التعيين عبر البريد الإلكتروني
  const resetCodemessage = `Hi ${user.name},\n\nWe received a request to reset the password on your E-shop account.\n\nYour reset code is: ${resetCode}\n\nEnter this reset code to complete the reset.\n\nThanks for helping us keep your account secure.\n\nThe E-Shop Team`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 minutes)",
      message: resetCodemessage,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(
      new ApiError("There was an error sending the reset code.", 500)
    );
  }

  // 7) الرد بالنجاح
  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email." });
});

// @desc verify Password reset code
// @route GET /api/v1/auth/verifyresetcode
// access Public
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  // get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  // check if resetCode expired
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Invalid or Expired Reset Code"));
  }

  // 2) Restet code Valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({ status: "Sucesse" });
});

// @desc Reset Password
// @route GET /api/v1/auth/resetpassword
// access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) get user on based email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no User With This Email:${req.body.email}`, 404)
    );
  }

  // 2) check if reset code verfied
  if (!user.passwordResetVerified) {
    return next(new ApiError(`Reset Code not verfied`, 400));
  }

  // 3) Update User Token and password
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 4) generate a new Token
  const token = createToken(user._id);

  res.status(200).json({ token: token });
});
