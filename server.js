const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
const url = require("url");
const dbManager = require("./loginMongoDBManager");
const asosDBManager = require("./asosMongoDBManager");
const morgan = require("morgan");
const session = require("client-sessions");
const detectOnlineStore = require("./utils");

const port = process.env.PORT || 1337;

app.use("/assets", express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(morgan("dev"));

app.use(
  session({
    cookieName: "session",
    secret: "random_string_goes_here",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
  })
);

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.session.user) {
    res.redirect("/dashboard");
  } else {
    next();
  }
};

function checkSignIn(req, res, next) {
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
});

app.get("/dashboard", checkSignIn, function(req, res) {
  async function getItems(user) {
    let saleItems = [];
    saleItems = await asosDBManager.getAllAsosItems(user);
    res.render("index", {
      saleItems: saleItems,
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

  await asosDBManager.checkAsosProductInDB({ productId: productId }, function(
    data
  ) {
    if (data !== null && data !== undefined) {
      callback1(data);
    } else {
      console.log("it does not exist");
      callback2();
      return null;
    }
  });
}

app.post("/addUrl", async function(req, res) {
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
      .then(function(response) {
        res.redirect("/dashboard");
      })
      .catch(e => {
        console.log("error ", e);
      });
  }
});

app.get("*", function(req, res) {
  res.render("404");
});

// Any error
app.use(function(err, req, res, next) {
  return res.status(500).render("error");
});

app.listen(port, "127.0.0.1");
