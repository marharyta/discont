const express = require("express");
const router = express.Router();
const dbManager = require("./loginMongoDBManager");
const asosDBManager = require("./asosMongoDBManager");
const url = require("url");
const axios = require("axios");
const { detectOnlineStore } = require("./utils");
const { checkAsosItemInDB } = require("./utils");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("./config");

// const checkSignIn = (req, res, next) => {
//   if (req.session.user) {
//     console.log("user session detected", req.session.user);
//     next(); //If session exists, proceed to page
//   } else {
//     var err = new Error("user session not detected", req.session.user);
//     //res.redirect("/login");
//     next(); //Error, trying to access unauthorized page!
//   }
// };

// router.use(checkSignIn);

// Middleware Authentication
router.use((req, res, next) => {
  console.log("middleware", req.path, req.cookies);
  // Check if it's not login page and my-token cookie is not existed > redirect to login page
  // if ("/login" !== req.path && !req.cookies.hasOwnProperty("my-token")) {
  //   console.log("res.redirect /login");
  //   res.redirect("/login");
  // } else if ("/login" === req.path && !req.cookies.hasOwnProperty("my-token")) {
  //   console.log("res.redirect /dashboard");
  //   res.redirect("/login");
  // } else {
  // }

  next();
});

router.get("/", (req, res) => {
  // if (req.session.user) {
  //   res.redirect("/dashboard");
  // } else {
  // }

  res.redirect("/login");
});

// login
router
  .get("/login", (req, res) => {
    res.render("login", {
      logoutStataus: false
    });
  })
  .post("/login", (req, res) => {
    console.log("we received a request AAA", req.headers);
    const login = req.body.login;
    const password = req.body.password;

    console.log("post login ", login, password);
    dbManager
      .loginPerson(login, password)
      .then(user => {
        // console.log("ud", user);
        // req.session.userName = username;
        // req.session.user = username;
        const token = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });

        console.log("token", token);

        // Save JWT to cookie
        res.cookie("my-token", token, { maxAge: 10000, httpOnly: true });

        // Send destinated url to client
        // res.send({ url: "http://localhost:1337" });
        // res.render("dashboard");
      })
      .catch(e => {
        console.log("invalid credentials");
        res.end("Invalid credentials");
      });
  });

// sign up logic
router
  .get("/signup", function (req, res) {
    res.render("signup");
  })
  .post("/signup", function (req, res) {
    const username = req.body.login;
    const password = req.body.password;

    dbManager
      .signUpPerson(username, password)
      .then(user => {
        console.log("person has been registered", user);
        // create session here
        // req.session.user = username;

        res.redirect("/login");
        // .status(200)
        // .set({
        //   Authorization: `Bearer ${token}`,
        //   "X-Access-Token": token
        // })
      })
      .catch(e => console.log("something failed suring signup"));
  });

// log out
router.get("/logout", (req, res) => {
  // req.session.destroy(function() {
  //   console.log("user logged out.");
  // });
  res.render("login", {
    logoutStataus: true
  });
});

router.get("/dashboard", function (req, res) {
  const decoded = jwt.verify(req.cookies["my-token"], "my-token-key");
  console.log("decoded", decoded);

  async function getItems(user) {
    let saleItems = [];
    saleItems = await asosDBManager.getAllAsosItems(user);

    res.render("index", {
      saleItems: saleItems,
      user: decoded.login,
      productExists: false,
      productLoading: false
    });

    // res.render("index", {
    //   saleItems: saleItems,
    //   user: decoded.login,
    //   productExists: false,
    //   productLoading: false
    // });
  }

  // if (req.session.user) {
  getItems(req.session.user);
  // } else {
  //   res.redirect("/login");
  // }
});

router.get("/dashboard/:itemId", function (req, res) {
  async function getSingleItem(item) {
    let saleItems = [];
    saleItems = await asosDBManager.getAsosItem(item);
    res.render("sale", {
      saleItems: saleItems,
      productExists: req.query.productExists ? true : false
    });
  }

  // console.log("req.session.userName", req.session);
  if (req.session.user) {
    getSingleItem(req.params.itemId);
  } else {
    res.redirect("/login");
  }
});

router.post("/deleteItem/", async function (req, res) {
  console.log("delete path works");
  const url1 = req.body.item_id;
  console.log("request params", url1);
  asosDBManager.deleteAsosItem({ productId: url1 }, req.session.user, () =>
    res.redirect("/dashboard")
  );
});

router.post("/addUrl", async function (req, res) {
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

router.get("*", function (req, res) {
  res.render("404");
});

module.exports = router;
