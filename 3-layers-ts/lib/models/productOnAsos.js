"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AsosProductsModel = void 0;

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
const AsosProductsModel = mongoose.model("asosproducts", productOnAsos);
exports.AsosProductsModel = AsosProductsModel;