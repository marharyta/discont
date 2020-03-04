const mongoose = require("mongoose");
const UsersModel = require('../../models/user');
const mongooseConnect = require('./mongooseConnector');
require("dotenv").config();

function loginPerson(login, password) {
    mongoose.connect(process.env.moongoDBLink, { useNewUrlParser: true }).then(d => {
        console.log("connection opened");
    });

    return new Promise(function (resolve, reject) {
        console.log('login started');
        UsersModel.findOne({ login: login, password: password })
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

module.exports = loginPerson;