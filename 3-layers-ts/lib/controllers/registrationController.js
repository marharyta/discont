"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.postRegistration = exports.getRegistration = void 0;

const registerPerson = require("../database/mongodb/register");

const getRegistration = (req, res, next) => {
  res.render("signup");
};

exports.getRegistration = getRegistration;

const postRegistration = (req, res, next) => {
  const username = req.body.login;
  const password = req.body.password;
  registerPerson(username, password).then(data => {
    // create session here
    req.session.user = username;
    res.redirect("/login");
  }).cach(err => {
    next(err);
  });
};

exports.postRegistration = postRegistration;