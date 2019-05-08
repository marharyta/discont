var mongoose = require("mongoose");
require("dotenv").config();

// Define schema for product
const Schema = mongoose.Schema;

const user = new Schema({
  login: String,
  password: String,
  products: Array
});

const AppUsers = mongoose.model("users", user);

function loginPerson(login, password) {
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

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
const dbManager = {
  loginPerson: loginPerson,
  signUpPerson: signUpPerson
};
module.exports = dbManager;
