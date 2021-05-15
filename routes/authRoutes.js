const express = require("express");
const { body } = require("express-validator");
const User = require("../models/user");
const controller = require("../controllers/authController");
const router = express.Router();

router.put(
  "/create",
  [
    body("username", "username is required.").trim().not().isEmpty(),
    body("username").custom((value, { req }) => {
      return User.findOne({ username: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("This username has already been taken.");
        }
      });
    }),
    body("password", "password is required.").trim().not().isEmpty(),
    body("password", "Password should contain at least 8 characters.")
      .trim()
      .isLength({ min: 8 }),
    body("email", "email is required.").trim().not().isEmpty(),
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("This email has already been used.");
          }
        });
      }),
    body("first_name", "first_name is required.").trim().not().isEmpty(),
    body("last_name", "last_name is required.").trim().not().isEmpty(),
    body("type", "type is required.").trim().not().isEmpty(),
  ],
  controller.create
);

router.post("/login", controller.login);

router.put("/update", controller.update);

module.exports = router;
