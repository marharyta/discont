"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UsersModel = void 0;

const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  login: String,
  password: String,
  products: Array
});
const UsersModel = mongoose.model("users", userSchema);
exports.UsersModel = UsersModel;