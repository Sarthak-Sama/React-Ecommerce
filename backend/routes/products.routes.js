const express = require("express");
const productModel = require("../models/product.model");
const upload = require("../config/multer.config");
const authMiddleware = require("../middlewares/auth.middleware");
const productController = require("../controllers/product.controller");
const { auth } = require("firebase-admin");

const router = express.Router();
// ---------- GET ROUTES --------------//

router.get("/all", indexController.getAllProducts);
router.get("/womens-wear", productController.getWomensWear);
router.get("/mens-wear", productController.getMensWear);
router.get("/kids", productController.getKidsWear);
router.get("/sale", productController.getSaleItems);

router.get("/:id", productController.getProductById);

// -------- POST ROUTES ------- //
router.post(
  "/create-product",
  authMiddleware.isAuthenticated,
  authMiddleware.isSeller,
  upload.any("image"),
  productController.createProduct
);

router.post(
  "/delete-product/:id",
  authMiddleware.isAuthenticated,
  authMiddleware.isAdmin,
  productController.deleteProduct
);

module.exports = router;
