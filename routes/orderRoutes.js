const express = require("express");
const { body } = require("express-validator");
const controller = require("../controllers/orderController");
const authenticate = require("../middleware/authenticate");
const router = express.Router();

router.post(
  "/add",
  authenticate,
  [
    body("quantity", "quantity is required.").trim().not().isEmpty(),
    body("product_id", "product_id is required.").trim().not().isEmpty(),
  ],
  controller.addOrder
);

router.get("/get", authenticate, controller.getOrders);

router.put("/update/:id", authenticate, controller.updateOrder);

router.delete("/delete/:id", authenticate, controller.deleteOrder);

module.exports = router;
