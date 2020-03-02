const http = require("http");
// var fs = require("fs");
// const express = require("express");
// const app = express();

const scrapeAsosProductPage = require("./asosProductPageScraper");
// const dbManager = require("./loginMongoDBManager");
const asosDBManager = require("./database/mongodb/asosProducts");
// const nodemailer = require("nodemailer");

function checkAsosProduct(dataURL) {
  return scrapeAsosProductPage(dataURL)
    .then(data => {
      if (data.isDiscounted) {
        return {
          title: data.productTitle,
          discount: data.calculatedDiscount
        };
      } else {
        return {
          title: "none",
          discount: "none"
        };
      }
    })
    .catch(e => {
      console.log("error getting or saving the data", e);
    });
}

http
  .createServer((request, response) => {
    response.setHeader("Connection", "keep-alive");
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Access-Control-Allow-Origin", "*");

    const items = asosDBManager.getAllAsosItems("me").then(data => {
      const promiseArray = [];
      data.map(a => {
        promiseArray.push(checkAsosProduct(a.productURL));
      });

      Promise.all(promiseArray).then(a => {
        console.log(a);
        a.map(a => {
          if (a !== undefined && !isNaN(a.discount)) {
            response.write(`data: ${a.title} ${a.discount} \n\n`);
          }
        });
      });
    });
  })
  .listen(5000);
