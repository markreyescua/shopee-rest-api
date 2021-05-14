const express = require("express");
const { body } = require("express-validator");
const Order = require("../models/order");
const controller = require("../controllers/orderController");
const router = express.Router();

router.get("/", controller.getOrders);

router.post("/", controller.createOrder);

router.get("/:id", controller.getOrder);

router.put("/:id", controller.updateOrder);

router.delete("/:id", controller.deleteOrder);

module.exports = router;
