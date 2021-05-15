const express = require("express");
const { body } = require("express-validator");
const controller = require("../controllers/productController");
const authenticate = require("../middleware/authenticate");
const router = express.Router();

router.post(
  "/create",
  authenticate,
  [
    body("product_sku", "product_sku is required.").trim().not().isEmpty(),
    body("product_name", "product_name is required.").trim().not().isEmpty(),
    body("product_description", "product_description is required.")
      .trim()
      .not()
      .isEmpty(),
    body("price", "price is required.").trim().not().isEmpty(),
  ],
  controller.createProduct
);

router.get("/get", authenticate, controller.getProducts);

router.get("/get/:id", authenticate, controller.getProduct);

router.put("/update/:id", authenticate, [], controller.updateProduct);

router.delete("/delete/:id", authenticate, controller.deleteProduct);

module.exports = router;
