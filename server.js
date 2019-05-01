const express = require("express");
var http = require("http");
const app = express();
var path = require("path");
var bodyParser = require("body-parser");
var fs = require("fs");
const axios = require("axios");
const url = require("url");
const uuid = require("uuid/v4");
const scrapeZalandoProductPage = require("./zalandoProductPageScraper");
const dbManager = require("./mongoDBManager");
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var session = require("client-sessions");

// var admin = require("firebase-admin");
// var serviceAccount = require("./discont-7ce3a-firebase-adminsdk-qcevs-2bfadd8a3f.json");
// // discont-7ce3a-firebase-adminsdk-qcevs-2bfadd8a3f.json

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://discont-7ce3a.firebaseio.com"
// });

// var passport = require("passport"),
//   LocalStrategy = require("passport-local").Strategy;

// https://www.airpair.com/node.js/posts/top-10-mistakes-node-developers-make

// https://scotch.io/tutorials/use-ejs-to-template-your-node-application

// https://thecodebarbarian.com/sending-web-push-notifications-from-node-js.html
// for push notifications
// for email notifications
// https://thecodebarbarian.com/sending-web-push-notifications-from-node-js.html

// https://scotch.io/tutorials/build-and-understand-a-simple-nodejs-website-with-user-authentication

//postgresql
// https://itnext.io/production-ready-node-js-rest-apis-setup-using-typescript-postgresql-and-redis-a9525871407
const port = process.env.PORT || 1337;

let saleItems = [];

app.use("/assets", express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(morgan("dev"));

// add & configure middleware
// app.use(
//   session({
//     key: "user_sid",
//     secret: "somerandonstuffs",
//     resave: true,
//     saveUninitialized: false,
//     cookie: {
//       expires: 600000
//     }
//   })
// );

// // Route not found (404)
// app.use(function(req, res, next) {
//   return res.status(404).send({ message: "Route" + req.url + " Not found." });
// });

// // Any error
// app.use(function(err, req, res, next) {
//   return res.status(500).send({ error: err });
// });

app.use(
  session({
    cookieName: "session",
    secret: "random_string_goes_here",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
  })
);

// app.use((req, res, next) => {
//   // console.log("session checker", req.session);
//   // if (req.session.user && req.cookies.user_sid) {
//   //   res.redirect("/dashboard");
//   // } else {
//   //   next();
//   // }
//   // if (req.session.user) {
//   //   console.log(req.session.user);
//   //   next();
//   // } else {
//   //   // res.redirect("/login");
//   // }
//   next();
// });

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  // console.log("session checker", req.session.user, req.cookies.user_sid);
  if (req.session.user) {
    console.log(req.session.user);
    res.redirect("/dashboard");
  } else {
    next();
  }
};

function checkSignIn(req, res, next) {
  console.log("req.session.user", req.session.user);
  if (req.session.user) {
    next(); //If session exists, proceed to page
  } else {
    var err = new Error("Not logged in!");
    console.log(req.session.user);
    next(err); //Error, trying to access unauthorized page!
  }
}

// route for Home-Page
app.get("/", (req, res) => {
  // console.log("req.session", req.session);
  res.redirect("/login");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app
  .route("/signup")
  .get(function(req, res) {
    res.render("signup");
  })
  .post(function(req, res) {
    var username = req.body.login,
      password = req.body.password;
    dbManager.signUpPerson(username, password).then(d => {
      // res.redirect("/");
      // create session here
      req.session.user = username;
      res.redirect("/login");
    });
  });

app.get("/logout", function(req, res) {
  req.session.destroy(function() {
    console.log("user logged out.");
  });
  res.render("login");
});

app.post("/login", function(req, res) {
  var username = req.body.login,
    password = req.body.password;
  // const info = url.parse(req.body.url);
  dbManager
    .loginPerson(username, password)
    .then(d => {
      console.log("ud", d);
      req.session.userName = username;
      req.session.user = true;
      req.session.user = username;
      res.redirect("/dashboard");
    })
    .catch(e => {
      res.end("Invalid credentials");
    });
  // console.log("login req", req.body);
});

app.get("/dashboard", checkSignIn, function(req, res) {
  console.log("we are in dashboard");
  console.log("req.session.userName", req.session);

  async function getItems(user) {
    saleItems = await dbManager.getAllItems(user);
    res.render("index", {
      saleItems: saleItems.reverse(),
      productExists: req.query.productExists ? true : false,
      productLoading: req.query.productLoading ? true : false
    });
  }

  if (req.session.user) {
    getItems(req.session.user);
  } else {
    res.redirect("/login");
  }
});

app.get("/dashboard/:itemId", function(req, res) {
  async function getSingleItem(item) {
    saleItems = await dbManager.getAnItem(item);
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

function detectOnlineStore(url) {
  // regex for store domains
  const asosRegex = /asos/g;
  const zalandoRegex = /zalando/g;
  const nastygalRegex = /nastygal(?=\.com)/g;
  const stockmannRegex = /zalando/g;

  // check if link is from any supported website
  const isAsos = asosRegex.test(url);
  const isZalando = zalandoRegex.test(url);
  const isNastygal = nastygalRegex.test(url);

  // throw error if cannot find any website
  if (!isAsos && !isZalando && !isNastygal) {
    // res.end("Cannot find website ");
    return "not found";
  } else if (isAsos) {
    return "asos";
  } else if (isZalando) {
    return "zalando";
  }
}

async function checkAsosItemInDB(url, callback1, callback2) {
  console.log("checkItem");
  const extractProductId = /(?:\/prd\/)\d{3,50}(?=\?)/g;
  const extractProductIdNumber = /\d{3,50}/g;

  const productIdArray = extractProductId.exec(url);
  const productId = extractProductIdNumber.exec(productIdArray[0])[0];

  if (!Number.isInteger(parseInt(productId))) {
    // catch an error
    throw new Error("product ID not detected");
    return null;
  }

  await dbManager.chechProductInDB({ productId: productId }, function(data) {
    if (data !== null && data !== undefined) {
      // console.log("it exists woooohoo", data);
      // return data;
      callback1(data);
    } else {
      console.log("it does not exist");
      callback2();
      return null;
    }
  });

  // if (productData !== undefined && productData !== null) {
  //   //console.log("productData !== undefined", productData !== undefined);
  //   return productData;
  // }
}

app.post("/addUrl", async function(req, res) {
  // get url from request
  const url1 = url.parse(req.body.url);
  const storePrint = detectOnlineStore(url1.host);

  if (storePrint === "asos") {
    const itemChecked = await checkAsosItemInDB(
      url1.href,
      data => {
        dbManager.updateProductInDB(data, req.session.user);
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
    // console.log("now we know req.session.user", req.session.user);
    // res.redirect("/dashboard?productLoading=true");

    axios
      .post("http://localhost:1555/addUrl", {
        url: url1,
        name: req.session.user ? req.session.user : "undefined user"
      })
      .then(function(response) {
        // console.log("do we have it already?", response.data);
        res.redirect("/dashboard?productLoading=false");
      })
      .catch(e => {
        console.log("error ", e);
      });
  }
});

// app.get("/getItems", function(req, res) {
//   let allAsosItems = [];
//   res.setHeader("Content-Type", "application/json");
//   async function getItems() {
//     allAsosItems = await dbManager.getAllItems();
//     res.end(JSON.stringify(allAsosItems));
//   }

//   if (allAsosItems.length === 0) {
//     getItems();
//   } else {
//     res.end(JSON.stringify(allAsosItems));
//   }
// });

app.get("*", function(req, res) {
  res.render("404");
});

app.listen(port, "127.0.0.1");
