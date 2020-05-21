const mongoose = require("mongoose");
import { UsersModel } from "../../models/user";
const mongooseConnect = require("./mongooseConnector");
require("dotenv").config();

export function loginPerson(login, password) {
  console.log("loginPerson", login);
  mongoose
    .connect(process.env.moongoDBLink, { useNewUrlParser: true })
    .then(d => {
      console.log("connection opened");
    });
  return new Promise(function(resolve, reject) {
    console.log("login started");
    UsersModel.findOne({ login: login, password: password })
      .then(data => {
        console.log("we logged in!", data);

        mongoose.disconnect().then(d => {
          console.log("conection closed ");
        });

        if (data) {
          if (data.login === login && password === password) {
            resolve(data);
          } else {
            console.log("we are about to reject", login, password);
            reject();
          }
        }
      })
      .catch(e => {
        console.log("error trying to log in ", e);
        reject();
      });
  });
}
