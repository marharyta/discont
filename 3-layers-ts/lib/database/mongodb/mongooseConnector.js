"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mongooseConnect = void 0;

const mongoose = require("mongoose");

const mongooseConnect = next => {
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  }).catch(e => {
    console.log("we got an error here", e);
  });
};

exports.mongooseConnect = mongooseConnect;