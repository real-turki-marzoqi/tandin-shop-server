const express = require('express');
const {
  getBrands,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  brandeImageProssing,
  updateBrandImage,
  deleteBrandImage,
 
  
  deleteAll,
} = require('../controllers/brandController');
const {
  createBrandValidator,
  getBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require('../utils/validators/brandValidator');

const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(getBrands)
  .post(
    authController.auth,
    authController.allowedTo('admin', 'manager'),
    uploadBrandImage,
    brandeImageProssing,
    createBrandValidator,
    createBrand
  )
  .delete(deleteAll);

// router.use(idValidation);
router
  .route('/:id')
  .get(getBrandValidator, getBrand)
  .put(
    authController.auth,
    authController.allowedTo('admin', 'manager'),
    
    uploadBrandImage,
    updateBrandImage,
    updateBrandValidator,
    updateBrand
  )
  .delete(
    authController.auth,
    authController.allowedTo('admin'),
    deleteBrandImage,
    deleteBrandValidator,
    deleteBrand
  );

module.exports = router;
