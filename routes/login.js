const express = require('express');
const router = express.Router();

/* Login page. */
router
    .get("/", (req, res) => {
        res.render("login", {
            logoutStataus: false
        });
    })
    .post("/", (req, res) => {
        const username = req.body.login;
        const password = req.body.password;

        console.log('post login ', username, password);
        dbManager
            .loginPerson(username, password)
            .then(d => {
                console.log("ud", d);
                req.session.userName = username;
                req.session.user = username;
                res.redirect("/asosItems");
            })
            .catch(e => {
                console.log('invalid credentials')
                res.end("Invalid credentials");
            });
    });

module.exports = router;