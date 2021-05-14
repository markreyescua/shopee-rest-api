const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

exports.create = (req, res, next) => {
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

  bcrypt
    .hash(password, 12)
    .then((hash) => {
      const user = User({
        username: username,
        password: hash,
        first_name: firstName,
        last_name: lastName,
        email: email,
        number: number,
        address: address,
        shop_name: shopName,
        type: type,
      });
      return user.save();
    })
    .then((user) => {
      res.status(201).json({
        message: "Account successfully created.",
        userId: user._id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        type: user.type,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.login = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ username: username })
    .then((user) => {
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((authValid) => {
      if (!authValid) {
        const error = new Error("Invalid username/password.");
        error.statusCode = 401;
        throw error;
      }
      res.status(200).json({
        message: "Successfully signed in.",
        user: {
          id: loadedUser._id.toString(),
          username: loadedUser.username,
          first_name: loadedUser.first_name,
          last_name: loadedUser.last_name,
          email: loadedUser.email,
          number: loadedUser.number,
          address: loadedUser.address,
          shop_name: loadedUser.shop_name,
          type: loadedUser.type,
        },
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.update = (req, res, next) => {
  // TODO: add update user api here
};
