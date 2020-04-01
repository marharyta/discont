const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
const url = require("url");
const morgan = require("morgan");
const session = require("client-sessions");
const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

require("dotenv").config();

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

// process.env.moongoDBLink

// Define schema for product
const Schema = mongoose.Schema;

const user = new Schema({
  login: String,
  password: String,
  products: Array
});

const AppUsers = mongoose.model("users", user);

function loginPerson(login, password) {
  return mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");

    return new Promise(function(resolve, reject) {
      AppUsers.findOne({ login: login, password: password })
        .then(data => {
          console.log("we logged in!", data);

          mongoose.disconnect().then(d => {
            console.log("conection closed ");
          });

          if (data.login === login && password === password) {
            resolve(data);
          } else {
            reject();
          }
        })
        .catch(e => {
          console.log("error trying to log in ", e);
          reject();
        });
    });
  });
}

function signUpPerson(login, password) {
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  return new Promise(function(resolve, reject) {
    const user = AppUsers({ login: login, password: password });
    user.save(function(err) {
      if (err) {
        console.log("err", err);
        reject();
      }
      console.log("user data saved");

      mongoose.disconnect().then(d => {
        console.log("conection closed ");
      });
      resolve({ login: login });
    });
  });
}

const dbManager = {
  loginPerson: loginPerson,
  signUpPerson: signUpPerson
};

const productOnAsos = new Schema({
  productId: String,
  images: Array,
  productTitle: String,
  productURL: String,
  price: String,
  previousPrice: String,
  currency: String,
  calculatedDiscount: Number,
  isDiscounted: Boolean,
  users: Array
});
const AsosProducts = mongoose.model("asosproducts", productOnAsos);

function checkAsosProductInDB(productData, callback) {
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  AsosProducts.findOne({ productId: productData.productId }).then(product => {
    if (product === undefined || product === null) {
      console.log("we need to add product");
      mongoose.disconnect().then(d => {
        callback(product);
        console.log("conection closed ");
      });
    } else {
      console.log("product already exists");
      mongoose.disconnect().then(d => {
        callback(product);
        console.log("conection closed ");
      });
    }
  });
}

function addAsosProductToDB(productData, username, callback) {
  console.log("addProductToDB start");
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  AsosProducts.findOne({ productId: productData.productId }).then(r => {
    console.log("find one");
    if (r == undefined || r == null) {
      console.log("we need to add products");
      // put that data into DB
      productData.users.push(username);
      const product = AsosProducts(productData);
      product.save(function(err) {
        if (err) {
          console.log("err", err);
        }
        console.log("product data saved");
        mongoose.disconnect().then(d => {
          console.log("conection closed ");
        });
        callback();
      });
    } else {
      console.log("product already exists");
      mongoose.disconnect().then(d => {
        console.log("conection closed ");
      });
      callback();
    }
  });
}

function updateAsosProductInDB(productData, username, callback) {
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  AsosProducts.findOne({ productId: productData.productId }).then(r => {
    // console.log("rule the world", r.users);
    if (!r.users.includes(username)) {
      r.users.push(username);
      r.save(function(err) {
        if (err) {
          console.log("err", err);
        }
        console.log("product data saved");
      });
    } else {
      console.log("array already includes that username");
      mongoose
        .disconnect()
        .then(d => {
          console.log("conection closed ");
        })
        .catch(e => {
          console.log("we got an error here", e);
        });
    }
  });
}

async function getAllAsosItems(username) {
  console.log("getAllItems");
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  return await AsosProducts.find({}).then(d => {
    mongoose.disconnect().then(d => {
      console.log("conection closed ");
    });
    return d.filter(item => item.users.includes(username));
  });
}

async function getAsosItem(productId) {
  console.log("getAllItems");
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  return await AsosProducts.find({ productId: productId }).then(d => {
    mongoose.disconnect().then(d => {
      console.log("conection closed ");
    });
    return d;
  });
}

async function deleteAsosItem(productId) {
  console.log("getAllItems");
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  return await AsosProducts.find({ productId: productId }).then(d => {
    mongoose.disconnect().then(d => {
      console.log("conection closed ");
    });
    //we only need to delete username from the list attached to the item
    // no need to delete from the db all together
    return d;
  });
}

const asosDBManager = {
  checkAsosProductInDB: checkAsosProductInDB,
  addAsosProductToDB: addAsosProductToDB,
  updateAsosProductInDB: updateAsosProductInDB,
  getAllAsosItems: getAllAsosItems,
  getAsosItem: getAsosItem,
  deleteAsosItem: deleteAsosItem
};

async function scrapeAsosProductPage(url, username) {
  console.log("url to debug", url);
  const extractProductId = /(?:\/prd\/)\d{3,50}(?=\?)/g;
  const extractProductIdNumber = /\d{3,50}/g;

  const productIdArray = extractProductId.exec(url);
  const productId = extractProductIdNumber.exec(productIdArray[0])[0];

  if (!Number.isInteger(parseInt(productId))) {
    throw new Error("product ID not detected");
    return null;
  }

  let price = null;
  let previousPrice = null;
  let currency = null;
  let discount = null;

  axios
    .get(
      `https://www.asos.com/api/product/catalogue/v2/stockprice?productIds=${productId}&currency=EUR&store=ROE`
    )
    .then(response => {
      const itemInfo = response.data[0];
      price = itemInfo.productPrice.current;
      previousPrice = itemInfo.productPrice.previous;
      currency = itemInfo.productPrice.currency;

      if (
        parseInt(previousPrice.value) !== parseInt(price.value) &&
        parseInt(previousPrice.value) !== 0
      ) {
        discount = parseInt(previousPrice.value) - parseInt(price.value);
      } else {
        discount = 0;
      }
    })
    .catch(e => console.log("price information not awailable", e));

  // open headless browser to inspect the page
  let imageArray = [];

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36"
  );

  await page
    .goto(url, { waitUntil: "networkidle2" })
    .catch(e => console.log("navigation failed ", e));

  await page
    .waitFor(3000)
    .then(() => console.log("we waited for 3 seconds"))
    .catch(e => {
      page
        .screenshot({ path: "photoScreen1.png" })
        .catch(e => console.log("screenshot 0 failed", e));
    });

  const productPageBody = await page
    .$$("body", body => body[0])
    .then(body => {
      console.log("we got the body");
      return body[0];
    })
    .catch(e => {
      console.log("body dectection failed", e);
    });

  const html = await page.evaluate(html => html.innerHTML, productPageBody);
  const $ = cheerio.load(html, { withDomLvl1: true });
  const h1 = $(".product-hero h1").text();
  const mainImage = $(".fullImageContainer .img").attr("src");
  const secondaryImage = $(".product-gallery-static img").attr("src");

  imageArray.push(mainImage);
  imageArray.push(secondaryImage);

  await browser.close();

  return {
    productId: productId,
    images: imageArray,
    productTitle: h1,
    productURL: url,
    price: price.text,
    previousPrice: previousPrice.text,
    currency: currency,
    calculatedDiscount: discount,
    users: [username],
    isDiscounted: discount > 0 ? true : false
  };
}

async function getProductInformation(url) {
  return await scrapeAsosProductPage(url);
}

let saleItems = [];

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
    saleItems = await asosDBManager.getAllAsosItems(user);
    res.render("index", {
      saleItems: saleItems.reverse(),
      deleteItem: deleteItem,
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
        scrapeAsosProductPage(url1.href, req.body.name)
          .then(data => {
            console.log("we got here");
            asosDBManager.addAsosProductToDB(data, req.session.user, () => {
              return res.redirect("/dashboard");
            });
          })
          .catch(e => {
            console.log("error getting or saving the data", e);
          });
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
    // axios
    //   .post("http://localhost:1555/addUrl", {
    //     url: url1,
    //     name: req.session.user ? req.session.user : "undefined user"
    //   })
    //   .then(function(response) {
    //     // console.log("do we have it already?", response.data);
    //     res.redirect("/dashboard?productLoading=false");
    //   })
    //   .catch(e => {
    //     console.log("error ", e);
    //   });
  }
});

function deleteItem(itemID) {
  // asosDBManager.deleteAsosItem(itemID);
  console.log("delete", itemID);
}

app.get("*", function(req, res) {
  res.render("404");
});

app.listen(port, "127.0.0.1");
