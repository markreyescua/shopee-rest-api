const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const Product = require("../models/product");

exports.createProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
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
  const imageUrl = `http://localhost:3000/${req.userId}-${productSku}`;

  const product = new Product({
    product_sku: productSku,
    product_name: productName,
    product_description: productDescription,
    price: price,
    image_url: imageUrl,
    user: req.userId,
  });

  try {
    await Product.count({ product_sku: productSku, user: req.userId }).then(
      (product) => {
        if (product) {
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
  let currentPage = +req.query.page || 1;
  let perPage = +req.query.count || 25;
  let nextPage = +currentPage;
  let totalPage = 0;
  let own = req.query.own || false;

  try {
    const count = await Product.find().countDocuments();
    totalPage = Math.ceil(count / perPage);
    nextPage = totalPage <= currentPage ? currentPage : currentPage + 1;

    let products;

    if (own) {
      products = await Product.find({ user: req.userId })
        .select("-_id -__v -updatedAt")
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    } else {
      products = await Product.find()
        .select("-_id -__v -updatedAt")
        .populate(
          "user",
          "_id email first_name last_name shop_name number address"
        )
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    }

    if (products.length < 1) {
      const error = new Error("No products found.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "Successfully retrieved products.",
      total_page: totalPage,
      current_page: currentPage,
      next_page: nextPage,
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
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
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
  // TODO: add update product api here
};

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.id;
  try {
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
