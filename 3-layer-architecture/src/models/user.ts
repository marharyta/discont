const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  login: String,
  password: String,
  products: Array
});

export const UsersModel = mongoose.model("users", userSchema);
