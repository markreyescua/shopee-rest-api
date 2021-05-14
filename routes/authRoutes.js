const express = require("express");
const { body } = require("express-validator");
const User = require("../models/user");
const controller = require("../controllers/authController");
const router = express.Router();

router.put(
  "/create",
  [
    body("username").custom((value, { req }) => {
      return User.findOne({ username: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject(
            "This username has already been taken. Please provide another username."
          );
        }
      });
    }),
    body("password", "Password should contain at least 8 characters.")
      .trim()
      .isLength({ min: 8 }),
    body("email")
      .isEmail()
      .withMessage(
        "Email format is invalid. Please provide a valid email address."
      )
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "This email has already been used. Please user other email address."
            );
          }
        });
      }),
    body("first_name", "First name is required.").trim().not().isEmpty(),
    body("last_name", "Last name is required.").trim().not().isEmpty(),
    body("type", "Account type is required.").trim().not().isEmpty(),
  ],
  controller.create
);

router.post("/login", controller.login);

router.put("/update", controller.update);

module.exports = router;
