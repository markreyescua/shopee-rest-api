const express = require("express");
const { body } = require("express-validator");
const Product = require("../models/product");
const controller = require("../controllers/productController");
const router = express.Router();

router.post("/create", [], controller.createProduct);

router.get("/get", controller.getProducts);

router.get("/get/:id", controller.getProduct);

router.put("/update/:id", controller.updateProduct);

router.delete("/delete/:id", controller.deleteProduct);

module.exports = router;
