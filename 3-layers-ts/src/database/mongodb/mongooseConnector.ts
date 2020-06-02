const mongoose = require("mongoose");
export const mongooseConnect = (next) => {
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  }).catch(e => {
    console.log("we got an error here", e);
  });
}



