"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkAsosProductInDB = checkAsosProductInDB;
exports.addAsosProductToDB = addAsosProductToDB;
exports.updateAsosProductInDB = updateAsosProductInDB;
exports.getAllAsosItems = getAllAsosItems;
exports.getAsosItem = getAsosItem;
exports.deleteAsosItem = deleteAsosItem;

var _mongooseConnector = require("./mongooseConnector");

var _productOnAsos = require("../../models/productOnAsos");

const mongoose = require("mongoose");

// require("dotenv").config();
const dotenv = require("dotenv");

dotenv.config();

function checkAsosProductInDB(productData, callback) {
  (0, _mongooseConnector.mongooseConnect)();

  _productOnAsos.AsosProductsModel.findOne({
    productId: productData.productId
  }).then(product => {
    if (product === undefined || product === null) {
      console.log("we need to add product");
      mongoose.disconnect().then(d => {
        callback(product);
        console.log("conection closed ");
      });
    } else {
      console.log("product already exists");
      mongoose.disconnect().then(d => {
        callback(product);
        console.log("conection closed ");
      });
    }
  });
}

function addAsosProductToDB(productData, callback) {
  console.log("addProductToDB start", process.env);
  (0, _mongooseConnector.mongooseConnect)();

  _productOnAsos.AsosProductsModel.findOne({
    productId: productData.productId
  }).then(r => {
    console.log("find one");

    if (r == undefined || r == null) {
      console.log("we need to add products"); // put that data into DB

      const product = (0, _productOnAsos.AsosProductsModel)(productData);
      product.save(function (err) {
        if (err) {
          console.log("err", err);
        }

        console.log("product data saved");
        mongoose.disconnect().then(d => {
          console.log("conection closed ");
        });
        callback();
      });
    } else {
      console.log("product already exists");
      mongoose.disconnect().then(d => {
        console.log("conection closed ");
      });
      callback();
    }
  });
}

function updateAsosProductInDB(productData, username, callback) {
  (0, _mongooseConnector.mongooseConnect)();

  _productOnAsos.AsosProductsModel.findOne({
    productId: productData.productId
  }).then(r => {
    console.log("rule the world", r.users);

    if (!r.users.includes(username)) {
      r.users.push(username);
      r.save(function (err) {
        if (err) {
          console.log("err", err);
        }

        console.log("product data saved");
      });
    } else {
      console.log("array already includes that username");
      mongoose.disconnect().then(d => {
        console.log("conection closed ");
      }).catch(e => {
        console.log("we got an error here", e);
      });
    }
  });
}

async function getAllAsosItems(username) {
  console.log("getAllItems");
  (0, _mongooseConnector.mongooseConnect)();
  return await _productOnAsos.AsosProductsModel.find({}).then(d => {
    mongoose.disconnect().then(d => {
      console.log("conection closed ");
    }); // console.log("the vitamin d", d);

    return d.filter(item => {
      // console.log("toxic", item);
      return item.users.includes(username);
    });
  });
}

async function getAsosItem(productId) {
  console.log("getAllItems");
  (0, _mongooseConnector.mongooseConnect)();
  return await _productOnAsos.AsosProductsModel.find({
    productId: productId
  }).then(d => {
    mongoose.disconnect().then(d => {
      console.log("conection closed ");
    });
    return d;
  });
}

async function deleteAsosItem(productData) {
  console.log("we get to delete");
  (0, _mongooseConnector.mongooseConnect)();
  return await _productOnAsos.AsosProductsModel.remove({
    productId: productData.productId
  }).then(r => {
    mongoose.disconnect().then(d => {
      console.log("conection closed ");
    }).catch(e => {
      console.log("we got an error here", e);
    });
  });
}