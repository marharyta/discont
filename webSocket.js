// socket
const http = require("http");
var fs = require("fs");
http
  .createServer((request, response) => {
    response.setHeader("Connection", "keep-alive");
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Access-Control-Allow-Origin", "*");

    console.log("headers", response);
    let id = 1;
    // Send event every 3 seconds or so forever...
    setInterval(() => {
      // const src = fs.createReadStream("./text.txt");
      // src.pipe(res);
      // response.write(src);
      console.log("something happened");
      response.write("data: message" + "\n\n");
      id++;
    }, 3000);
  })
  .listen(5000);
