const express = require("express");
const app = express();

const scrapeAsosProductPage = require("./asosProductPageScraper");
const dbManager = require("./mongoDBManager");

const port = process.env.PORT || 1555;

app.use(express.urlencoded());
app.use(express.json());

app.post("/addUrl", function(req, res) {
  scrapeAsosProductPage(req.body.url.href, req.body.name)
    .then(data => {
      dbManager.addAsosProductToDB(data, () => res.end("product added"));
    })
    .catch(e => {
      console.log("error getting or saving the data", e);
    });
});

app.listen(port, "127.0.0.1");
