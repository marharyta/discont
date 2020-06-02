const asosDBManager = require("../database/mongodb/asosProducts");
const scrapeAsosProductPage = require("../asosScraper/asosProductPageScraper");
const url = require("url");
// const axios = require("axios");
const {
  detectOnlineStore,
  checkAsosItemInDB
} = require("../asosScraper/utils");

// const Worker = require('webworker-threads').Worker;

async function getItems(user) {
  return await asosDBManager.getAllAsosItems(user);
}

async function deleteItem(productData) {
  return await asosDBManager.deleteAsosItem(productData);
}

async function getSingleItem(item) {
  return await asosDBManager.getAsosItem(item);
}

export function getDashboard(req, res, next) {
  if (req.session.user) {
    getItems(req.session.user).then(saleItems => {
      res.render("index", {
        saleItems: saleItems,
        user: req.session.user,
        username: req.session.user,
        productExists: false,
        productLoading: false
      });
    }).catch(err => {
      next(err);
    });
  } else {
    res.redirect("/login");
  }
}

export function getDashboardItem(req, res, next) {
  if (req.session.user) {
    getSingleItem(req.params.itemId).then(saleItems => {
      res.render("sale", {
        saleItems: saleItems,
        productExists: req.query.productExists ? true : false
      });
    }).catch(err => {
      next(err);
    });
  } else {
    res.redirect("/login");
  }
}

export async function deleteDashboardItem(req, res, next) {
  if (req.session.user) {
    deleteItem({ productId: req.params.itemId })
      .then(d => res.redirect("/asosItems"))
      .catch(err => {
        next(err);
      });
  } else {
    res.redirect("/login");
  }
}

export async function addUrl(req, res, next) {
  // get url from request
  const url1 = url.parse(req.body.url);
  const storePrint = detectOnlineStore(url1.host);

  if (storePrint === "asos") {
    await checkAsosItemInDB(
      url1.href,
      data => {
        asosDBManager.updateAsosProductInDB(data, req.session.user);
        res.redirect(`/asosItems/${data.productId}?productExists=true`);
      },
      () => {
        // makeRequest(res);
        console.log('here is where we would normally make a request')

        // const worker = new Worker(function () {
        //   // no arror function because this is for the thread 
        //   this.onmessage = function () {

        //     scrapeAsosProductPage(url1.href, req.session.user)
        //       .then(data => {
        //         console.log(data)
        //         postMessage(data);

        //       })
        //       .catch(e => {
        //         console.log("error scraping or saving the data", e);
        //       });
        //   }

        // });
        // worker.onmessage = function (data) {
        //   console.log('data')
        //   return asosDBManager.addAsosProductToDB(data, () => res.end("product added"));
        // }

        // worker.postMessage();
        scrapeAsosProductPage(url1.href, req.session.user)
          .then(data => {
            console.log(data)
            // optimistic UI
            // res.end("product added");
            return asosDBManager.addAsosProductToDB(data, () => res.end("product added"));
          })
          .catch(e => {
            console.log("error scraping or saving the data", e);
          });
      }
    );
  } else if (storePrint === "zalando") {
    res.end("Not supported");
  } else {
    res.end("Not supported");
  }


  // uncomment: perf
  // function makeRequest(res) {
  //   axios
  //     .post("http://localhost:1555/asosItemUrl", {
  //       url: url1,
  //       name: req.session.user ? req.session.user : "undefined user"
  //     })
  //     .then(function () {
  //       res.redirect("/");
  //     })
  //     .catch(e => {
  //       console.log("error ", e);
  //     });
  // }
}
