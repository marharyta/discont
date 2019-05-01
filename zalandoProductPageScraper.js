const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const request = require("request");
var rp = require("request-promise");

// set options for next request
var options = {
  headers: { "user-agent": "node.js" }
};

const moneyFormat = /(((\d{1,}(?=\s|\.|\,|\')(\s|\.|\,|\')(?=\s|\d{1,})(\s|\d{1,3})*)(\d*(?=\.|\,)(\.|\,)(?=\d{1,3})\d{1,3}))|(\d{1,}(?=\.|\,|\s*)(\.|\,|\s)\d{1,3}))/g;
function scrapeZalandoProductPage(url) {
  // probably zalando
  // https://www.zalando.fi/topshop-joni-skinny-farkut-tp721n09q-q12.html

  request(url, options, function(error, response, html) {
    var $ = cheerio.load(html, { withDomLvl1: true });

    const cost = moneyFormat.exec($(".h-product-price.topSection").text());

    const priceInfo = JSON.parse(
      $("#z-vegas-pdp-props")[0]
        .children[0].data.toString()
        .replace(/^\<\!\[CDATA/, "")
        .replace(/\]\>$/, "")
    )[0].model.displayPrice;

    // const image = JSON.parse(
    //   $("#z-vegas-pdp-props")[0]
    //     .children[0].data.toString()
    //     .replace(/^\<\!\[CDATA/, "")
    //     .replace(/\]\>$/, "")
    // )[0].model.articleInfo;

    const image0 = $("#galleryImage-0")[0].attribs.src;
    const image1 = $("#galleryImage-1")[0].attribs.src;
    console.log("image", image0, image1);

    // return {
    //     productId: productId,
    //     images: imageArray,
    //     productTitle: h1,
    //     productURL: url,
    //     price: price.text,
    //     previousPrice: previousPrice.text,
    //     currency: priceInfo.price.currency,
    //     calculatedDiscount: discount
    //   };
  });

  //   request(
  //     "https://www.zalando.fi/api/rr/pr/sajax?flowId=rdTGPK8hwvjdNxU5&try=2",
  //     options,
  //     function(error, response, html) {
  //       if (!error) {
  //         console.log(response.body);
  //       }
  //     }
  //   );
  //  console.log("html", html);
  // console.log(
  //   "product-price",
  //   $(".h-product-price.topSection").text()
  // );

  // console.log(
  //   "json",
  //   JSON.parse(
  //     $("#z-vegas-pdp-props")[0]
  //       .children[0].data.toString()
  //       .replace(/^\<\!\[CDATA/, "")
  //       .replace(/\]\>$/, "")
  //   )[0].model.displayPrice
  // );
}

// async function getProductInformation(url) {
//   return await scrapeAsosProductPage(url);
// }

module.exports = scrapeZalandoProductPage;
