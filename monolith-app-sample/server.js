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

// const cluster = require('cluster');

// console.log(cluster.isMaster)

require("dotenv").config();
const port = process.env.PORT || 1337;

const Schema = mongoose.Schema;

const user = new Schema({
  login: String,
  password: String,
  products: Array
});

const AppUsers = mongoose.model("users", user);

function openConnectionToDB() {
  return mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });
}

function closeConnectionToDB() {
  return mongoose.disconnect().then(d => {
    console.log("conection to MongoDB closed ");
    return d;
  }).catch(e => console.log('failed to Close DB connection'));
}

function loginPerson(login, password) {
  return openConnectionToDB().then(() => new Promise(function (resolve, reject) {
    AppUsers.findOne({ login: login, password: password })
      .then(data => {
        closeConnectionToDB();

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
  })).catch(e => e);

}

function signUpPerson(login, password) {
  return openConnectionToDB().then(() => new Promise(function (resolve, reject) {
    const user = AppUsers({ login: login, password: password });
    user.save(function (err) {
      if (err) {
        console.log("err", err);
        reject();
      }

      mongoose.disconnect().then(d => {
        console.log("conection closed ");
      });
      resolve({ login: login });
    });
  })).catch(e => e);
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
  return openConnectionToDB().then(() => AsosProducts.findOne({ productId: productData.productId }).then(product => {
    if (product === undefined || product === null) {
      mongoose.disconnect().then(d => {
        callback(product);
        console.log("conection closed ");
      });
    } else {
      mongoose.disconnect().then(d => {
        callback(product);
        console.log("conection closed ");
      });
    }
  })).catch(e => e);
}

function addAsosProductToDB(productData, username, callback) {
  return openConnectionToDB().then(() =>

    AsosProducts.findOne({ productId: productData.productId }).then(r => {
      if (r == undefined || r == null) {
        productData.users.push(username);
        const product = AsosProducts(productData);
        product.save(function (err) {
          if (err) {
            console.log("err", err);
          }
          mongoose.disconnect().then(d => {
            console.log("conection closed ");
          });
          callback();
        });
      } else {
        mongoose.disconnect().then(d => {
          console.log("conection closed ");
        });
        callback();
      }
    })).catch(e => e);
}

function updateAsosProductInDB(productData, username, callback) {
  return openConnectionToDB().then(() =>

    AsosProducts.findOne({ productId: productData.productId }).then(r => {
      if (!r.users.includes(username)) {
        r.users.push(username);
        r.save(function (err) {
          if (err) {
            console.log("err", err);
          }
        });
      } else {
        mongoose
          .disconnect()
          .then(d => {
            console.log("conection closed ");
          })
          .catch(e => {
            console.log("we got an error here", e);
          });
      }
    })).catch(e => e);
}

async function getAllAsosItems(username) {
  return openConnectionToDB().then(() => AsosProducts.find({}).then(d => {
    mongoose.disconnect().then(d => {
      console.log("conection closed ");
    });
    return d.filter(item => item.users.includes(username));
  })).catch(e => e);
}

async function getAsosItem(productId) {
  return openConnectionToDB().then(() => AsosProducts.find({ productId: productId }).then(d => {
    mongoose.disconnect().then(d => {
      console.log("conection closed ");
    });
    return d;
  })).catch(e => e);
}

// uncomment
// async function deleteAsosItem(productId) {
//   openConnectionToDB()

//   return await AsosProducts.findOneAndDelete({ productId: productId }).then(d => {
//     mongoose.disconnect().then(d => {
//       console.log("conection closed ");
//     });
//     return d;
//   }).catch(e => e)
// }

const asosDBManager = {
  checkAsosProductInDB: checkAsosProductInDB,
  addAsosProductToDB: addAsosProductToDB,
  updateAsosProductInDB: updateAsosProductInDB,
  getAllAsosItems: getAllAsosItems,
  getAsosItem: getAsosItem,
  // uncomment
  // deleteAsosItem: deleteAsosItem
};

async function scrapeAsosProductPage(url, username) {
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

const sessionChecker = (req, res, next) => {
  if (req.session.user) {
    res.redirect("/dashboard");
  } else {
    next();
  }
};

function checkSignIn(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    var err = new Error("Not logged in!");
    next(err);
  }
}

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app
  .route("/signup")
  .get(function (req, res) {
    res.render("signup");
  })
  .post(function (req, res) {
    var username = req.body.login,
      password = req.body.password;
    dbManager.signUpPerson(username, password).then(d => {
      req.session.user = username;
      res.redirect("/login");
    });
  });

app.get("/logout", function (req, res) {
  req.session.destroy(function () {
    console.log("user logged out.");
  });
  res.render("login");
});

app.post("/login", function (req, res) {
  var username = req.body.login,
    password = req.body.password;
  dbManager
    .loginPerson(username, password)
    .then(d => {
      req.session.userName = username;
      req.session.user = true;
      req.session.user = username;
      res.redirect("/dashboard");
    })
    .catch(e => {
      res.end("Invalid credentials");
    });
});

app.get("/dashboard", checkSignIn, function (req, res) {
  async function getItems(user) {
    saleItems = await asosDBManager.getAllAsosItems(user);
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

app.get("/dashboard/:itemId", function (req, res) {
  async function getSingleItem(item) {
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

function detectOnlineStore(url) {
  const asosRegex = /asos/g;
  const zalandoRegex = /zalando/g;
  const nastygalRegex = /nastygal(?=\.com)/g;

  const isAsos = asosRegex.test(url);
  const isZalando = zalandoRegex.test(url);
  const isNastygal = nastygalRegex.test(url);

  if (!isAsos && !isZalando && !isNastygal) {
    return "not found";
  } else if (isAsos) {
    return "asos";
  } else if (isZalando) {
    return "zalando";
  }
}

async function checkAsosItemInDB(url, callback1, callback2) {
  const extractProductId = /(?:\/prd\/)\d{3,50}(?=\?)/g;
  const extractProductIdNumber = /\d{3,50}/g;

  const productIdArray = extractProductId.exec(url);
  const productId = extractProductIdNumber.exec(productIdArray[0])[0];

  if (!Number.isInteger(parseInt(productId))) {
    throw new Error("product ID not detected");
    return null;
  }

  await asosDBManager.checkAsosProductInDB({ productId: productId }, function (
    data
  ) {
    if (data !== null && data !== undefined) {
      callback1(data);
    } else {
      callback2();
      return null;
    }
  });
}

app.post("/addUrl", async function (req, res) {
  const url1 = url.parse(req.body.url);
  const storePrint = detectOnlineStore(url1.host);

  // uncomment
  // throw new Error("random error");

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
            // uncomment
            // throw Error();
            asosDBManager.addAsosProductToDB(data, req.session.user, (data) => {
              // uncomment
              // console.log('why doesnt readirect happen', data)
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
    throw new Error("no store detected");
    res.end("Not supported");
  }
});

// uncomment
// version 1
// app.post("/dashboard/delete/:itemId", function (req, res) {
//   console.log('we try to delete item', req.url)
//   async function getSingleItem(item) {
//     saleItems = await asosDBManager.deleteAsosItem(itemID);
//     res.render("sale", {
//       saleItems: saleItems,
//       productExists: req.query.productExists ? true : false
//     });
//   }
//   if (req.session.user) {
//     console.log('req.params.itemId', req.params.itemId)
//     getSingleItem(req.params.itemId);
//   }
// });

//version 2

// app.post("/dashboard/delete/:itemId", function (req, res) {
//   console.log('we try to delete item', req.url)
//   async function getSingleItem(itemID) {
//     saleItems = await asosDBManager.deleteAsosItem(itemID);
//     res.render("sale", {
//       saleItems: saleItems,
//       productExists: req.query.productExists ? true : false
//     });
//   }
//   if (req.session.user) {
//     console.log('req.params.itemId', req.params.itemId)
//     getSingleItem(req.params.itemId);
//   }
// });




app.get("*", function (req, res) {
  res.render("404");
});

app.listen(port, "127.0.0.1");
