"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLogout = getLogout;

function getLogout(req, res, next) {
  res.render("login", {
    logoutStataus: false
  });
}