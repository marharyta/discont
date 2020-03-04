const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require('cors');
const morgan = require("morgan");
const session = require("client-sessions");
const router = require('./router');

const port = process.env.PORT || 1339;

app.use("/assets", express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(cors());

app.use(
  session({
    cookieName: "session",
    secret: "random_string_goes_here",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
  })
);

app.use('/', router);

// Any error
app.use(function (err, req, res, next) {
  return res.status(500).render("error");
});

app.listen(port, "127.0.0.1");
