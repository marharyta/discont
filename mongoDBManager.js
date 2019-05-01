var mongoose = require("mongoose");
require("dotenv").config();

// process.env.moongoDBLink

// Define schema for product
const Schema = mongoose.Schema;

const user = new Schema({
  login: String,
  password: String,
  products: Array
});
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

const AppUsers = mongoose.model("users", user);

function loginPerson(login, password) {
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  // console.log("login", login, password);

  return new Promise(function(resolve, reject) {
    AppUsers.findOne({ login: login, password: password })
      .then(data => {
        console.log("we logged in!", data);

        mongoose.disconnect().then(d => {
          console.log("conection closed ");
        });

        if (data.login === login && password === password) {
          resolve(data);
        } else {
          reject();
        }
      })
      .catch(e => {
        console.log("error trying to log in ", e);
        reject();
      });
  });
}

function signUpPerson(login, password) {
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  return new Promise(function(resolve, reject) {
    // AppUsers.findOne({ login: login, password: password })
    //   .then(data => {
    //     console.log("we logged in!");

    //     mongoose.disconnect().then(d => {
    //       console.log("conection closed ");
    //     });
    //     resolve();
    //   })
    //   .catch(e => {
    //     reject();
    //   });
    const user = AppUsers({ login: login, password: password });
    user.save(function(err) {
      if (err) {
        console.log("err", err);
        reject();
      }
      console.log("user data saved");

      mongoose.disconnect().then(d => {
        console.log("conection closed ");
      });
      resolve({ login: login });
    });
  });
}

function chechProductInDB(productData, callback) {
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  // console.log("productData", productData);

  AsosProducts.findOne({ productId: productData.productId }).then(product => {
    // console.log("find one");
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

function addProductToDB(productData, callback) {
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

function updateProductInDB(productData, username, callback) {
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  AsosProducts.findOne({ productId: productData.productId }).then(r => {
    console.log("rule the world", r.users);
    r.users.push(username);
    r.save(function(err) {
      if (err) {
        console.log("err", err);
      }
      console.log("product data saved");
      mongoose
        .disconnect()
        .then(d => {
          console.log("conection closed ");
        })
        .catch(e => {
          console.log("we got an error here", e);
        });
    });

    // callback();
  });
}

async function getAllItems(username) {
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

async function getAnItem(productId) {
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
  chechProductInDB: chechProductInDB,
  addProductToDB: addProductToDB,
  updateProductInDB: updateProductInDB,
  getAllItems: getAllItems,
  loginPerson: loginPerson,
  signUpPerson: signUpPerson,
  getAnItem: getAnItem
};
module.exports = dbManager;
