const router = require("./index");

/* Register page. */
router
    .get("/signup", function (req, res) {
        res.render("signup");
    })
    .post("/signup", function (req, res) {
        var username = req.body.login,
            password = req.body.password;
        dbManager.signUpPerson(username, password).then(d => {
            // create session here
            req.session.user = username;
            res.redirect("/login");
        });
    });

module.exports = router;