const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const session = require("client-sessions");
const router = require('./router');

const port = process.env.PORT || 1337;

app.use("/assets", express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(morgan("dev"));

app.use(
  session({
    cookieName: "session",
    secret: "random_string_goes_here",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
  })
);
const checkSignIn = (req, res, next) => {
  if (req.session.user) {
    console.log("user session detected", req.session.user);
    next(); //If session exists, proceed to page
  } else {
    var err = new Error("user session not detected", req.session.user);
    //res.redirect("/login");
    next(); //Error, trying to access unauthorized page!
  }
}
// route for Home-Page
app.use(checkSignIn);
app.use('/', router);

// Any error
app.use(function (err, req, res, next) {
  return res.status(500).render("error");
});

app.listen(port, "127.0.0.1");
