"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const checkSignIn = (err, req, res, next) => {
  if (err) {
    next(err);
  }

  if (req.session.user) {
    console.log("user session detected", req.session.user);
    next();
  } else {
    console.log("user session not detected");
    next();
  }
};

var _default = checkSignIn;
exports.default = _default;