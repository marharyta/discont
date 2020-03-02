const mongoose = require("mongoose");
module.exports = mongooseConnect => mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
});