"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.postLogin = exports.getLogin = void 0;

var _login = require("../database/mongodb/login");

const getLogin = (req, res, next) => {
  res.render("login", {
    logoutStataus: false
  });
};

exports.getLogin = getLogin;

const postLogin = (req, res, next) => {
  const username = req.body.login;
  const password = req.body.password;
  (0, _login.loginPerson)(username, password).then(() => {
    console.log("req.session.user", username);
    req.session.userName = username;
    req.session.user = username;
    res.redirect("/asosItems");
  }).catch(err => {
    next(err);
    res.end("Invalid credentials", err);
  });
};

exports.postLogin = postLogin;