const express = require('express');
const router = express.Router();
const checkSignIn = require('./auth/auth');
const { getLogin, postLogin } = require('./controllers/loginController');
const { getRegistration, postRegistration } = require('./controllers/registrationController');
const { getLogout } = require('./controllers/logoutController');
const { getDashboard, getDashboardItem, deleteDashboardItem, addUrl } = require('./controllers/dashboardController');

router.use(checkSignIn);

// on initial login

/* GET home page. */
router.get("/", (req, res) => {
    if (req.session.user) {
        res.redirect("/dashboard");
    } else {
        res.redirect('/login');
    }
});

// login 
router
    .get("/login", getLogin)
    .post("/login", postLogin);

// sign up logic 
router
    .get("/signup", getRegistration)
    .post("/signup", postRegistration);

// log out
router
    .get("/logout", getLogout);

// dashboard
router
    .get("/dashboard", getDashboard);

router
    .get("/dashboard/:itemId", getDashboardItem);

router
    .post("/deleteItem/", deleteDashboardItem);

router.
    post("/addUrl", addUrl);

router
    .get("*", function (req, res) {
        res.render("404");
    });


module.exports = router;