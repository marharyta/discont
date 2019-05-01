var mongoose = require("mongoose");
require("dotenv").config();

// process.env.moongoDBLink

// Define schema for product
const Schema = mongoose.Schema;

const productOnAsos = new Schema({
  productId: String,
  images: Array,
  productTitle: String,
  productURL: String,
  price: String,
  previousPrice: String,
  currency: String,
  calculatedDiscount: Number,
  isDiscounted: Boolean,
  users: Array
});
const AsosProducts = mongoose.model("asosproducts", productOnAsos);

function checkAsosProductInDB(productData, callback) {
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  AsosProducts.findOne({ productId: productData.productId }).then(product => {
    if (product === undefined || product === null) {
      console.log("we need to add product");
      mongoose.disconnect().then(d => {
        callback(product);
        console.log("conection closed ");
      });
    } else {
      console.log("product already exists");
      mongoose.disconnect().then(d => {
        callback(product);
        console.log("conection closed ");
      });
    }
  });
}

function addAsosProductToDB(productData, callback) {
  console.log("addProductToDB start");
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  AsosProducts.findOne({ productId: productData.productId }).then(r => {
    console.log("find one");
    if (r == undefined || r == null) {
      console.log("we need to add products");
      // put that data into DB
      const product = AsosProducts(productData);
      product.save(function(err) {
        if (err) {
          console.log("err", err);
        }
        console.log("product data saved");
        mongoose.disconnect().then(d => {
          console.log("conection closed ");
        });
        callback();
      });
    } else {
      console.log("product already exists");
      mongoose.disconnect().then(d => {
        console.log("conection closed ");
      });
      callback();
    }
  });
}

function updateAsosProductInDB(productData, username, callback) {
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  AsosProducts.findOne({ productId: productData.productId }).then(r => {
    console.log("rule the world", r.users);
    if (!r.users.includes(username)) {
      r.users.push(username);
      r.save(function(err) {
        if (err) {
          console.log("err", err);
        }
        console.log("product data saved");
      });
    } else {
      console.log("array already includes that username");
      mongoose
        .disconnect()
        .then(d => {
          console.log("conection closed ");
        })
        .catch(e => {
          console.log("we got an error here", e);
        });
    }
  });
}

async function getAllAsosItems(username) {
  console.log("getAllItems");
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  return await AsosProducts.find({}).then(d => {
    mongoose.disconnect().then(d => {
      console.log("conection closed ");
    });
    return d.filter(item => item.users.includes(username));
  });
}

async function getAsosItem(productId) {
  console.log("getAllItems");
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  return await AsosProducts.find({ productId: productId }).then(d => {
    mongoose.disconnect().then(d => {
      console.log("conection closed ");
    });
    return d;
  });
}

async function deleteAsosItem(productId) {
  console.log("getAllItems");
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  return await AsosProducts.find({ productId: productId }).then(d => {
    mongoose.disconnect().then(d => {
      console.log("conection closed ");
    });
    return d;
  });
}

const dbManager = {
  checkAsosProductInDB: checkAsosProductInDB,
  addAsosProductToDB: addAsosProductToDB,
  updateAsosProductInDB: updateAsosProductInDB,
  getAllAsosItems: getAllAsosItems,
  getAsosItem: getAsosItem
};
module.exports = dbManager;
