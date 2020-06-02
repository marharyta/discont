const mongoose = require("mongoose");
import { UsersModel } from "../../models/user";
const mongooseConnect = require("./mongooseConnector");
require("dotenv").config();

export function loginPerson(login, password) {
  console.log("we are trying to log in", login, password);
  return mongoose.connect(process.env.moongoDBLink).then(d => {
    return new Promise(function (resolve, reject) {
      return UsersModel.findOne({ login: login, password: password })
        .then(data => {
          console.log("we logged in!", data);

          mongoose.disconnect().then(d => {
            console.log("conection closed ");
          }).catch(e => {
            console.log("we got an error here", e);
          });

          if (data.login === login && password === password) {
            resolve(data);
          } else {
            reject(new Error('User not found'));
          }
        })
        .catch(err => {
          console.log("error trying to log in ", err);
          reject(err);
        });
    });
  }).catch(e => {
    console.log("we got an error here", e);
  });
}