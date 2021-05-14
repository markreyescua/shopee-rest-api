const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const schema = new Schema(
  {
    quantity: {
      type: Number,
      default: 0,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", schema);
