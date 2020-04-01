const mongoose = require("mongoose");
export const mongooseConnect = () =>
  mongoose
    .connect(process.env.moongoDBLink, { useNewUrlParser: true })
    .then(d => {
      console.log("connection opened");
    });
