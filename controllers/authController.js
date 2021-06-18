const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const constants = require("../util/constants");

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const username = req.body.username;
    const password = req.body.password;
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const email = req.body.email;
    const type = req.body.type;

    // optional fields
    const number = req.body.number;
    const address = req.body.address;
    const shopName = req.body.shop_name;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = User({
      username: username,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      email: email,
      number: number,
      address: address,
      shop_name: shopName,
      type: type,
    });
    await user.save();
    const token = jwt.sign(
      {
        username: user.username,
        email: user.email,
        userId: user._id.toString(),
        userType: user.type,
      },
      constants.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );
    res.status(201).json({
      message: "Account successfully created.",
      data: {
        user_id: user._id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        number: user.number,
        address: user.address,
        shop_name: user.shop_name,
        type: user.type,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        token: {
          access_token: token,
        },
      },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const user = await User.findOne({ username: username });

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid username/password.");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        username: user.username,
        email: user.email,
        userId: user._id.toString(),
        userType: user.type,
      },
      constants.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );
    res.status(200).json({
      message: "Successfully signed in.",
      data: {
        user_id: user._id.toString(),
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        number: user.number,
        address: user.address,
        shop_name: user.shop_name,
        type: user.type,
        token: {
          access_token: token,
        },
      },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.update = (req, res, next) => {
  // TODO: add update user api here
};

exports.delete = (req, res, next) => {
  // TODO: add delete user api here
};
