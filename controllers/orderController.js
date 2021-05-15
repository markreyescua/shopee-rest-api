const { validationResult } = require("express-validator");
const Order = require("../models/order");
const Product = require("../models/product");

exports.addOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    if (req.userType !== "customer") {
      const error = new Error("Unauthorized.");
      error.statusCode = 401;
      throw error;
    }

    const quantity = req.body.quantity;
    const product_id = req.body.product_id;

    const product = await Product.findById(product_id);
    if (!product) {
      const error = new Error("Product not found.");
      error.statusCode = 404;
      throw error;
    }

    const existingOrder = await Order.findOne({
      product: product,
      user: req.userId,
    });

    if (existingOrder) {
      const newQuantity = +existingOrder.quantity + +quantity;
      if (newQuantity < 0) {
        existingOrder.quantity = 0;
      } else {
        existingOrder.quantity = newQuantity;
      }
      existingOrder.save();
      res.status(201).json({
        message: "Successfully updated order!",
        order_id: existingOrder._id,
        quantity: existingOrder.quantity,
      });
    } else {
      if (quantity <= 0) {
        const error = new Error("Quantity should be greater than 0.");
        error.statusCode = 422;
        throw error;
      }
      const order = new Order({
        quantity: quantity,
        product: product,
        user: req.userId,
      });
      await order.save();
      res.status(201).json({
        message: "Successfully added order!",
        order_id: order._id,
        quantity: order.quantity,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (req.userType !== "customer") {
      const error = new Error("Unauthorized.");
      error.statusCode = 401;
      throw error;
    }

    const orders = await Order.find({ user: req.userId }).select("-__v");

    if (orders.length < 1) {
      const error = new Error("No orders found.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "Successfully retrieved orders.",
      orders: orders,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateOrder = (req, res, next) => {
  // TODO: add update order api here
};

exports.deleteOrder = async (req, res, next) => {
  try {
    if (req.userType !== "customer") {
      const error = new Error("Unauthorized.");
      error.statusCode = 401;
      throw error;
    }

    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      const error = new Error("No order with matching id found.");
      error.statusCode = 404;
      throw error;
    }

    if (order.user.toString() !== req.userId) {
      const error = new Error("You are not authorized to delete this order.");
      error.statusCode = 403;
      throw error;
    }

    await Order.findByIdAndRemove(order);
    res.status(200).json({
      message: "Successfully deleted order!",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
