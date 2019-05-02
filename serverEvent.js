const http = require("http");
var fs = require("fs");
const express = require("express");
const app = express();

const scrapeAsosProductPage = require("./asosProductPageScraper");
const dbManager = require("./mongoDBManager");
const asosDBManager = require("./asosMongoDBManager");
const nodemailer = require("nodemailer");

// check Asos products for discount
// this module is super buggy and unreliable

// https://www.codementor.io/joshuaaroke/sending-html-message-in-nodejs-express-9i3d3uhjr
// https://nodemailer.com/message/
// https://burnermail.io/

// async function mail() {
//   let account = await nodemailer.createTestAccount();

//   let transporter = nodemailer.createTransport({
//     host: "burner.977494f5@tryninja.io",
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: account.user, // generated ethereal user
//       pass: account.pass // generated ethereal password
//     }
//   });

//   // setup email data with unicode symbols
//   let mailOptions = {
//     from: '"Fred Foo 👻" <foo@example.com>', // sender address
//     to: "margarita.obraztsova@futurice.com", // list of receivers
//     subject: "Hello ✔", // Subject line
//     text: "Hello world?", // plain text body
//     html: "<b>Hello world?</b>" // html body
//   };

//   // send mail with defined transport object
//   let info = await transporter.sendMail(mailOptions);
// }

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
