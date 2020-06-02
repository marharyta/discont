const mongoose = require("mongoose");
const UsersModel = require("../../models/user");
require("dotenv").config();

function registerPerson(login, password) {
  mongoose.connect(process.env.moongoDBLink).then(d => {
    console.log("connection opened");
  });

  return new Promise(function (resolve, reject) {
    const user = UsersModel({ login: login, password: password });
    user.save(function (err) {
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

export default registerPerson;
