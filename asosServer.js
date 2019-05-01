const express = require("express");
const app = express();

const scrapeAsosProductPage = require("./asosProductPageScraper");
const dbManager = require("./mongoDBManager");

// TODO
const scrapeZalandoProductPage = require("./zalandoProductPageScraper");

const port = process.env.PORT || 1555;

app.use(express.urlencoded());
app.use(express.json());

// app.get("/addUrl", function(req, res) {
//   scrapeAsosProductPage(
//     "https://www.asos.com/liquor-n-poker/liquor-n-poker-skinny-jeans-with-extreme-distressing-ripped-knees/prd/6532933?clr=black&SearchQuery=&cid=28023&gridcolumn=4&gridrow=3&gridsize=4&pge=1&pgesize=72&totalstyles=1353"
//   )
//     .then(data => {
//       console.log("data is here baby", data);
//       res.end(JSON.stringify(data));
//     })
//     .catch(e => {
//       console.log("error getting or saving the data", e);
//     });
// });

app.post("/addUrl", function(req, res) {
  console.log("we got to post");
  // https://stackoverflow.com/questions/4295782/how-to-process-post-data-in-node-js
  // console.log("connection happened", req.body.url.href);
  // const extractProductId = /(?:\/prd\/)\d{3,50}(?=\?)/g;
  // const extractProductIdNumber = /\d{3,50}/g;
  // const productIdArray = extractProductId.exec(url);
  // const productId = extractProductIdNumber.exec(productIdArray[0])[0];
  // const productData = await dbManager.chechProductInDB(
  //   { productId: productId },
  //   data => {
  //     console.log("it exists woooohoo", data);
  //     if (data !== null && data !== undefined) {
  //       return data;
  //     }
  //   }
  // );
  // if (productData !== undefined) {
  //   // console.log("productData !== undefined", productData !== undefined);
  //   return productData;
  // }
  // if (!Number.isInteger(parseInt(productId))) {
  //   // catch an error
  //   throw new Error("product ID not detected");
  //   return null;
  // }
  scrapeAsosProductPage(req.body.url.href, req.body.name)
    .then(data => {
      // console.log("data is here baby", data);
      //  data.users.add("me");
      dbManager.addProductToDB(data, () => res.end("product added"));
    })
    .catch(e => {
      console.log("error getting or saving the data", e);
    });
});

app.listen(port, "127.0.0.1");
