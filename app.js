const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const compression = require("compression");
const constants = require("./util/constants");
const isUndefined = require("lodash/isUndefined");

const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);

const app = express();

const store = new MongoDbStore({
  uri: constants.MONGODB_URI,
  collection: "sessions",
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `images`);
  },
  filename: (req, file, cb) => {
    cb(null, `product-${new Date().toISOString()}-${file.originalname}`);
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
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

// middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

// sessions
app.use(
  session({
    secret: constants.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

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
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use(compression());

// Error Handler
app.use((error, req, res, next) => {
  const status = error.statusCode;
  const data = error.data;
  const message = !isUndefined(data) ? data[0].msg : error.message;
  res.status(status).json({
    message: message,
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
