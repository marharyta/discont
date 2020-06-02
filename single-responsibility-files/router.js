const express = require('express');
const router = express.Router();
const dbManager = require("./loginMongoDBManager");
const asosDBManager = require("./asosMongoDBManager");
const url = require("url");
const { detectOnlineStore } = require("./utils");
const { checkAsosItemInDB } = require("./utils");
const scrapeAsosProductPage = require("./asosProductPageScraper");

const checkSignIn = (req, res, next) => {
    if (req.session.user) {
        console.log("user session detected", req.session.user);
        next(); //If session exists, proceed to page
    } else {
        //Error, trying to access unauthorized page!
        //res.redirect("/login");
        next();
    }
}

// router.use(checkSignIn);

router.get("/", (req, res) => {
    // uncomment
    // throw new Error('error');
    if (req.session.user) {
        res.redirect("/dashboard");
    } else {
        res.redirect("/login");
    }
});

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
        dbManager
            .loginPerson(username, password)
            .then(d => {
                req.session.userName = username;
                req.session.user = username;
                res.redirect("/dashboard");
            })
            .catch(e => {
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

        if (req.session.user) {
            getSingleItem(req.params.itemId);
        } else {
            res.redirect("/login");
        }
    });

router
    .post("/deleteItem/", async function (req, res) {

        const url1 = req.body.item_id;
        asosDBManager.deleteAsosItem({ productId: url1 }, req.session.user, () => res.redirect('/dashboard'));
    });

router.
    post("/addUrl", async function (req, res, next) {
        const url1 = url.parse(req.body.url);
        const storePrint = detectOnlineStore(url1.host);

        if (storePrint === "asos") {
            await checkAsosItemInDB(
                url1.href,
                data => {
                    asosDBManager.updateAsosProductInDB(data, req.session.user);
                    res.redirect(`/dashboard/${data.productId}?productExists=true`);
                },
                () => {
                    scrapeAsosProductPage(url1.href, req.session.user)
                        .then(data => {
                            asosDBManager.addAsosProductToDB(data, () => {
                                res.redirect(`/dashboard/`)
                                return new Error('failed to add to DB')
                            })
                        })
                        .catch(e => {
                            // next(new Error('failed to add to DB'));
                            console.log("error getting or saving the data", e);
                        });
                }
            );
        } else if (storePrint === "zalando") {
            res.end("Not supported");
        } else {
            res.end("Not supported");
        }

        // uncomment perf
        // function makeRequest() {
        //     axios
        //         .post("http://localhost:1555/addUrl", {
        //             url: url1,
        //             name: req.session.user ? req.session.user : "undefined user"
        //         })
        //         .then(function (response) {
        //             res.redirect("/dashboard");
        //         })
        //         .catch(e => {
        //             console.log("error ", e);
        //         });
        // }
    });

router
    .get("*", function (req, res) {
        res.render("404");
    });

module.exports = router;