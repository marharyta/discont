const mongoose = require("mongoose");
module.exports = mongooseConnect => mongoose.connect(process.env.moongoDBLink, { useNewUrlParser: true }).then(d => {
    console.log("connection opened");
});