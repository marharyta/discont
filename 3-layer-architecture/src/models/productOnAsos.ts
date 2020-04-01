const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productOnAsos = new Schema({
  productId: String,
  images: Array,
  productTitle: String,
  productURL: String,
  price: String,
  previousPrice: String,
  currency: String,
  calculatedDiscount: Number,
  isDiscounted: Boolean,
  users: Array
});

export const AsosProductsModel = mongoose.model("asosproducts", productOnAsos);
