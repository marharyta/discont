// process.env.UV_THREADPOOL_SIZE = 1;

import express from "express";
// const cluster = require('cluster');
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import session from "client-sessions";
import router from "./router";

// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);

// // Fork workers.
//  for (let i = 0; i < numCPUs; i++) {
// cluster.fork();
// }

// cluster.on('exit', (worker, code, signal) => {
//   console.log(`worker ${worker.process.pid} died`);
// });
// } else {
const app = express();
const port = process.env.PORT || 8000;

app.use("/assets", express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
// app.set("view engine", "jsx");
// app.engine("jsx", require("express-react-views").createEngine());
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

app.use(router);

// Any error
app.use(function (err, req, res, next) {
  return res.status(500).render("error");
  next(err);
});

console.log("post", port);
app.listen(port);

// console.log(`Worker ${process.pid} started`);
// }