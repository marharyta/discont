const express = require("express");
const router = express.Router();
import checkSignIn from "./auth/auth";
import { getLogin, postLogin } from "./controllers/loginController";
import {
  getRegistration,
  postRegistration
} from "./controllers/registrationController";
const { getLogout } = require("./controllers/logoutController");
const {
  getDashboard,
  getDashboardItem,
  deleteDashboardItem,
  addUrl
} = require("./controllers/dashboardController");

router.use(checkSignIn);

// on initial login
router.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/asosItems");
  } else {
    res.redirect("/login");
  }
});

router.get("/login", getLogin).post("/login", postLogin);

router.get("/signup", getRegistration).post("/signup", postRegistration);

router.get("/logout", getLogout);

router.get("/asosItems", getDashboard);

router
  .get("/asosItems/:itemId", getDashboardItem)
  .post("/asosItems/:itemId", deleteDashboardItem);

router.post("/asosItemUrl", addUrl);

router.get("*", function(req, res) {
  res.render("404");
});

export default router;
