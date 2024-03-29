const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const axios = require("axios");

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
      // console.log("JSON.parse(response)", response.data[0]);
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
    .catch(e => console.log("navigation to browsers failed ", e));

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

module.exports = scrapeAsosProductPage;
