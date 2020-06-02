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


app.use('/', router);

// // Any error on app request
// app.use(function (error, req, res, next) {
//   if (error) {
//     console.log('any error');
//   }
//   next(error);
// });

// app.use(function handleDatabaseError(error, req, res, next) {
//   if (error instanceof MongoError) {
//     return res.status(503).json({
//       type: 'MongoError',
//       message: error.message
//     });
//   }
//   next(error);
// });

app.use(function handleDatabaseError(error, req, res, next) {
  console.log("we caught an error")

  if (error instanceof MongoError) {
    console.log('MongoError is logged')
    return res.status(503).json({
      type: 'MongoError',
      message: error.message
    });
  }
  next(error);
});

app.use(function (err, req, res, next) {
  if (err) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    return res.status(err.statusCode).render("error", {
      errorStatus: err.status
    });
  }
});
app.listen(port, "127.0.0.1");
