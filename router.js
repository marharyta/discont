const express = require('express');
const router = express.Router();
const checkSignIn = require('./auth/auth');
const { getLogin, postLogin } = require('./controllers/loginController');
const { getRegistration, postRegistration } = require('./controllers/registrationController');
const { getLogout } = require('./controllers/logoutController');
const { getDashboard, getDashboardItem, deleteDashboardItem, addUrl } = require('./controllers/dashboardController');

router.use(checkSignIn);

// on initial login
router.get("/", (req, res) => {
    if (req.session.user) {
        res.redirect("/asosItems");
    } else {
        res.redirect('/login');
    }
});

router
    .get("/login", getLogin)
    .post("/login", postLogin);

router
    .get("/signup", getRegistration)
    .post("/signup", postRegistration);

router.get("/logout", getLogout);

router.get("/asosItems", getDashboard);

router
    .get("/asosItems/:itemId", getDashboardItem)
    .post("/asosItems/:itemId", deleteDashboardItem);

router.post("/asosItemUrl", addUrl);

router
    .get("*", function (req, res) {
        res.render("404");
    });

module.exports = router;