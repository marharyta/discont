// check Asos products for discount

const express = require("express");
const app = express();

const scrapeAsosProductPage = require("./asosProductPageScraper");
const dbManager = require("./mongoDBManager");
const nodemailer = require("nodemailer");

// https://www.codementor.io/joshuaaroke/sending-html-message-in-nodejs-express-9i3d3uhjr
// https://nodemailer.com/message/
// https://burnermail.io/

async function mail() {
  let account = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "burner.977494f5@tryninja.io",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: account.user, // generated ethereal user
      pass: account.pass // generated ethereal password
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: "margarita.obraztsova@futurice.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>" // html body
  };

  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions);
}

scrapeAsosProductPage(
  "https://www.asos.com/asos-design/asos-design-suit-blazer-in-velvet/prd/10934048?clr=rust&SearchQuery=&cid=15620&gridcolumn=2&gridrow=3&gridsize=4&pge=1&pgesize=72&totalstyles=1073"
)
  .then(data => {
    // console.log("data is here baby", data);
    if (data.isDiscounted) {
      console.log("now there is a discount");
      // Generate test SMTP service account from ethereal.email
      // Only needed if you don't have a real mail account for testing
      mail();
    }
  })
  .catch(e => {
    console.log("error getting or saving the data", e);
  });
