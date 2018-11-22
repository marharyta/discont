const express = require("express");
var http = require("http");
const app = express();
var path = require("path");
var bodyParser = require("body-parser");
var fs = require("fs");

const port = process.env.PORT || 1337;

app.use("/assets", express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", function(req, res) {
  res.render("index");
});

app.get("/sale/:id", function(req, res) {
  res.render("sale", { saleID: req.params.id });
});

app.post("/addUrl", function(req, res) {
  res.end("thank you for " + req.body.url);
});

app.listen(port);

// viewed at http://localhost:8080
// app.get("/", function(req, res) {
//   res.sendFile(path.join(__dirname + "/index.html"));
// });

// http
//   .createServer(function(req, res) {
//     if (req.url === "/kitten") {
//       res.end("kitten");
//     }
//     res.writeHead(200, { "Content-Type": "text/html" });
//     var message = "hello, templates";
//     fs.createReadStream(__dirname + "/index.html", "utf8")
//       // .replace("{message}", message)
//       .pipe(res);
//     // res.end(html);
//   })
//   .listen(1337, "127.0.0.1");
