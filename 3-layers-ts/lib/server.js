"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _cors = _interopRequireDefault(require("cors"));

var _morgan = _interopRequireDefault(require("morgan"));

var _clientSessions = _interopRequireDefault(require("client-sessions"));

var _router = _interopRequireDefault(require("./router"));

// process.env.UV_THREADPOOL_SIZE = 1;
// const cluster = require('cluster');
// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);
//   // Fork workers.
// for (let i = 0; i < numCPUs; i++) {
//   cluster.fork();
// }
// cluster.fork();
// cluster.fork();
// cluster.fork();
// cluster.fork();
// cluster.fork();
// cluster.fork();
// cluster.fork();
// cluster.fork();
//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//   });
// } else {
const app = (0, _express.default)();
const port = process.env.PORT || 8000;
app.use("/assets", _express.default.static(__dirname + "/public"));
app.set("views", _path.default.join(__dirname, "views"));
app.use(_bodyParser.default.urlencoded({
  extended: true
}));
app.set("view engine", "ejs"); // app.set("view engine", "jsx");
// app.engine("jsx", require("express-react-views").createEngine());

app.use((0, _morgan.default)("dev"));
app.use((0, _cors.default)());
app.use((0, _clientSessions.default)({
  cookieName: "session",
  secret: "random_string_goes_here",
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
}));
app.use(_router.default); // Any error

app.use(function (err, req, res, next) {
  return res.status(500).render("error");
  next(err);
});
console.log("post", port);
app.listen(port); //   console.log(`Worker ${process.pid} started`);
// }