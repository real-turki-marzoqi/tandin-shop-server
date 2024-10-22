const asyncHandler = require("express-async-handler");
const User = require("../config/models/userModel");
const ApiError = require("../utils/apiError");


// @desc Add Product To WishList
// @route Post /api/v1/wishList
// access Public/protect/user
exports.addProductToWishList = asyncHandler(async(req,res,next)=>{

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $addToSet:{wishList:req.body.productId}
        },
        {new:true}
    );

    res.status(200).json({message:"Product Added Successfully To your WishList ",data:user.wishList})

})

// @desc Remove Product From WishList
// @route DELETE /api/v1/wishList/:productId
// access Public/protect/user
exports.removeProductFromWishList = asyncHandler(async(req,res,next)=>{

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull:{wishList:req.params.productId}
        },
        {new:true}
    );

    res.status(200).json({message:"Product Removed Successfully From your WishList ",data:user.wishList})

})  


// @desc    Get logged user wishlist
// @route   GET /api/v1/wishlist
// @access  Protected/User
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {

   
    const user = await User.findById(req.user._id).populate('wishList');

    
  
    res.status(200).json({
      status: 'success',
      results: user.wishList.length,
      data: user.wishList,
    });
  });