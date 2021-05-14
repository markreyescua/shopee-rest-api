const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const compression = require("compression");

const app = express();
const constants = require("./util/constants");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// controllers
const authRoutes = require("./routes/authRoutes");

// middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

// CORS policy
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/auth", authRoutes);
app.use(compression());

// Error Handler
app.use((error, req, res, next) => {
  const status = error.statusCode;
  const data = error.data;
  res.status(status).json({
    message: data[0].msg,
  });
});

mongoose.set("useUnifiedTopology", true);
mongoose
  .connect(constants.MONGODB_URI)
  .then(() => {
    console.log("Connected to then server");
    app.listen(constants.SERVER_PORT);
  })
  .catch((err) => {
    console.log(err);
  });
