const Nightmare = require("nightmare");
const nightmare = Nightmare({
  show: true
});

const puppeteer = require("puppeteer");

(async () => {
  // console.log("hello");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  page.on("request", request => {
    const headers = request.headers();
    headers["user-agent"] = "node.js";
    headers["host"] = "www.asos.com";

    request.continue({
      headers
    });
  });
  await page.goto(
    "https://www.asos.com/asos-design/asos-design-porcelain-platform-high-heels/prd/10564751?clr=black-gold-star&SearchQuery=&cid=20248&gridcolumn=3&gridrow=1&gridsize=4&pge=1&pgesize=72&totalstyles=80",
    { waitUntil: "networkidle2" }
  );

  await page
    // .waitFor(() => !!document.querySelector("body"))
    .waitForSelector("body")
    .then(handle => {
      console.log("we have body");
      //   .$$eval("div")
      //   .then(d => console.log("we got asos-product core-product"))
      //   .catch(e => console.log("asos-product error", e));
    });
  // .catch(e => console.log("asos-product error", e));
  await page.screenshot({ path: "screen2.png" });

  // await page
  //   .$("#asos-product")
  //   .then(d => console.log("asos-product", d))
  //   .catch(e => console.log("asos-product error", e));

  // const info = getApp.getProperties().then(d => d);
  // console.log("info", info);

  const a = await page.$$eval("h1", h1 => h1[0].innerHTML);
  // .then(h1 => {
  //   // h1[0]
  //   //   .asElement()
  //   //   .jsonValue()
  //   //   .then(obj => console.log(obj))
  //   //   .catch(e => e);
  //   return h1[0].$eval;
  //   // console.log("h1[0]");
  //   // h1[0].then(data => {
  //   //   data.$eval("h1", el => console.log("el", el));
  //   // });
  // })
  // .then(el => console.log("el", el))
  // .catch(e => console.log(e));

  console.log("a", a);
  // .$eval("img", img => console.log(img));

  // console.log("Dimensions:", dimensions);

  await browser.close();
})();

// const url =
// "https://www.asos.com/asos-design/asos-design-wool-woven-check-scarf-with-fringed-edge/prd/10393066?clr=multi&SearchQuery=&cid=20246&gridcolumn=2&gridrow=12&gridsize=4&pge=1&pgesize=72&totalstyles=186";

// console.log(url);
// console.log(nightmare.goto(url));
const selector = "#app";

// nightmare
//   .goto("https://www.npmjs.com")
//   .wait("#app")
//   .evaluate(selector => {
//     // now we're executing inside the browser scope.
//     return window.document.querySelector(selector);
//   }, selector)
//   .end()
//   .then(console.log)
//   .catch(error => {
//     console.error("Search failed:", error);
//   });
