"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _auth = _interopRequireDefault(require("./auth/auth"));

var _loginController = require("./controllers/loginController");

var _registrationController = require("./controllers/registrationController");

const express = require("express");

const router = express.Router();

const {
  getLogout
} = require("./controllers/logoutController");

const {
  getDashboard,
  getDashboardItem,
  deleteDashboardItem,
  addUrl
} = require("./controllers/dashboardController");

router.use(_auth.default); // on initial login

router.get("/", (req, res, next) => {
  if (req.session.user) {
    res.redirect("/asosItems");
  } else {
    res.redirect("/login");
  }
});
router.get("/login", _loginController.getLogin).post("/login", _loginController.postLogin);
router.get("/signup", _registrationController.getRegistration).post("/signup", _registrationController.postRegistration);
router.get("/logout", getLogout);
router.get("/asosItems", getDashboard);
router.get("/asosItems/:itemId", getDashboardItem).post("/asosItems/:itemId", deleteDashboardItem);
router.post("/asosItemUrl", addUrl);
router.get("*", function (req, res) {
  res.render("404");
});
var _default = router;
exports.default = _default;