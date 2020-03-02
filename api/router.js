const express = require('express');
const router = express.Router();
const dbManager = require("../loginMongoDBManager");
const asosDBManager = require("../asosMongoDBManager");
const url = require("url");
const axios = require("axios");
const { detectOnlineStore } = require("../utils");
const { checkAsosItemInDB } = require("../utils");
const checkSignIn = require('./auth');

router.use(checkSignIn);

// login 
router
    .get("/login", (req, res) => {
        res.render("login", {
            logoutStataus: false
        });
    })
    .post("/login", (req, res) => {
        const username = req.body.login;
        const password = req.body.password;

        console.log('post login ', username, password);
        dbManager
            .loginPerson(username, password)
            .then(d => {
                console.log("ud", d);
                req.session.userName = username;
                req.session.user = username;
                res.redirect("/dashboard");
            })
            .catch(e => {
                console.log('invalid credentials')
                res.end("Invalid credentials");
            });
    });

// sign up logic 
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

// log out
router
    .get("/logout", (req, res) => {
        req.session.destroy(function () {
            console.log("user logged out.");
        });
        res.render("login", {
            logoutStataus: true
        });
    });

router
    .get("/dashboard", function (req, res) {
        async function getItems(user) {
            let saleItems = [];
            saleItems = await asosDBManager.getAllAsosItems(user);

            res.render("index", {
                saleItems: saleItems,
                user: req.session.user,
                productExists: false,
                productLoading: false
            });

        }

        if (req.session.user) {
            getItems(req.session.user);
        } else {
            res.redirect("/login");
        }
    });

router
    .get("/dashboard/:itemId", function (req, res) {
        async function getSingleItem(item) {
            let saleItems = [];
            saleItems = await asosDBManager.getAsosItem(item);
            res.render("sale", {
                saleItems: saleItems,
                productExists: req.query.productExists ? true : false
            });
        }

        console.log("req.session.userName", req.session);
        if (req.session.user) {
            getSingleItem(req.params.itemId);
        } else {
            res.redirect("/login");
        }
    });

router
    .post("/deleteItem/", async function (req, res) {
        console.log("delete path works");
        const url1 = req.body.item_id;
        console.log('request params', url1);
        asosDBManager.deleteAsosItem({ productId: url1 }, req.session.user, () => res.redirect('/dashboard'));
    });

router.
    post("/addUrl", async function (req, res) {
        // get url from request
        const url1 = url.parse(req.body.url);
        const storePrint = detectOnlineStore(url1.host);

        if (storePrint === "asos") {
            const itemChecked = await checkAsosItemInDB(
                url1.href,
                data => {
                    asosDBManager.updateAsosProductInDB(data, req.session.user);
                    res.redirect(`/dashboard/${data.productId}?productExists=true`);
                },
                () => {
                    makeRequest();
                }
            );
        } else if (storePrint === "zalando") {
            res.end("Not supported");
        } else {
            res.end("Not supported");
        }

        // TODO: refactor this later

        function makeRequest() {
            axios
                .post("http://localhost:1555/addUrl", {
                    url: url1,
                    name: req.session.user ? req.session.user : "undefined user"
                })
                .then(function (response) {
                    res.redirect("/dashboard");
                })
                .catch(e => {
                    console.log("error ", e);
                });
        }
    });

router
    .get("*", function (req, res) {
        res.render("404");
    });


module.exports = router;