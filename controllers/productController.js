const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const Product = require("../models/product");

exports.createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    if (req.userType !== "admin") {
      const error = new Error("Unauthorized.");
      error.statusCode = 401;
      throw error;
    }
    if (!req.file) {
      const error = new Error("No image provided.");
      error.statusCode = 422;
      throw error;
    }

    const productSku = req.body.product_sku;
    const productName = req.body.product_name;
    const productDescription = req.body.product_description;
    const price = req.body.price;
    const imageUrl = `http://localhost:3000/${req.file.path}`;

    const product = new Product({
      product_sku: productSku,
      product_name: productName,
      product_description: productDescription,
      price: price,
      image_url: imageUrl,
      user: req.userId,
    });

    await Product.count({ product_sku: productSku, user: req.userId }).then(
      (product) => {
        if (product) {
          deleteImage(imageUrl);
          const error = new Error("Product already exists.");
          error.statusCode = 409;
          throw error;
        }
      }
    );

    await product.save();
    const user = await User.findById(req.userId);
    user.products.push(product);
    await user.save();

    res.status(201).json({
      message: "Successfully created product!",
      product: product,
      user: {
        _id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const own = req.query.own || false;
    let products;

    if (own == "true") {
      products = await Product.find({ user: req.userId }).select("-__v");
    } else {
      products = await Product.find()
        .select("-__v")
        .populate(
          "user",
          "_id email first_name last_name shop_name number address"
        );
    }

    if (products.length < 1) {
      const error = new Error("No products found.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "Successfully retrieved products.",
      products: products,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).select("-__v");
    if (!product) {
      const error = new Error("No product with matching id found.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Successfully retrieved product.",
      product: product,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateProduct = (req, res, next) => {
  if (req.userType !== "admin") {
    const error = new Error("Unauthorized.");
    error.statusCode = 401;
    throw error;
  }
  // TODO: add update product api here
};

exports.deleteProduct = async (req, res, next) => {
  try {
    if (req.userType !== "admin") {
      const error = new Error("Unauthorized.");
      error.statusCode = 401;
      throw error;
    }

    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      const error = new Error("No product with matching id found.");
      error.statusCode = 404;
      throw error;
    }

    if (product.user.toString() !== req.userId) {
      const error = new Error("You are not authorized to delete this product.");
      error.statusCode = 403;
      throw error;
    }

    await Product.findByIdAndRemove(productId);
    const user = await User.findById(req.userId);
    user.products.pull(productId);
    await user.save();
    res.status(200).json({
      message: "Successfully deleted product!",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

const deleteImage = (filePath) => {
  filePath = path.join(
    __dirname,
    "..",
    filePath.replace("http://localhost:3000/", "")
  );
  fs.unlink(filePath, (error) => {
    console.log(error);
  });
};
