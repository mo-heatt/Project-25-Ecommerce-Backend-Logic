const express = require('express');
const {getAllProducts, getProductDetails, updateProduct, deleteProduct, getProductReviews, deleteReview, createProductReview, createProduct, getAdminProducts, getProducts} = require('../controllers/productController');
const {isAutheticatedUser, authorizeRoles} = require('../middlewares/auth');

const router = express.Router();

router.route('/products').get(getAllProducts);
router.route('/product/all'),get(getProducts);

router.route('/admin/products').get(isAutheticatedUser, authorizeRoles("admin"), getAdminProducts);
router.route('/admin/product/new').post(isAutheticatedUser, authorizeRoles("admin"), createProduct);

router.route('/admin/product/:id')
    .put(isAutheticatedUser, authorizeRoles("admin"), updateProduct)
    .delete(isAutheticatedUser, authorizeRoles("admin"), deleteProduct);

router.route('/product/:id').get(getProductDetails);

router.route('/review').put(isAutheticatedUser, createProductReview);

router.route('/admin/reviews')
    .get(isAutheticatedUser, authorizeRoles("admin") ,getProductReviews)
    .delete(isAutheticatedUser, authorizeRoles("admin"), deleteReview);

module.exports = router;