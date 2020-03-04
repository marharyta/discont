const mongoose = require("mongoose");
const mongooseConnect = require("./mongooseConnector");
require("dotenv").config();

const AsosProductsModel = require('../../models/productOnAsos');

function checkAsosProductInDB(productData, callback) {
    mongooseConnect();

    AsosProductsModel.findOne({ productId: productData.productId }).then(product => {
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
    mongooseConnect();

    AsosProductsModel.findOne({ productId: productData.productId }).then(r => {
        console.log("find one");
        if (r == undefined || r == null) {
            console.log("we need to add products");
            // put that data into DB
            const product = AsosProductsModel(productData);
            product.save(function (err) {
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
    mongooseConnect();

    AsosProductsModel.findOne({ productId: productData.productId }).then(r => {
        console.log("rule the world", r.users);
        if (!r.users.includes(username)) {
            r.users.push(username);
            r.save(function (err) {
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
    mongooseConnect();

    return await AsosProductsModel.find({}).then(d => {
        mongoose.disconnect().then(d => {
            console.log("conection closed ");
        });

        console.log('the vitamin d', d);
        return d.filter(item => {
            console.log('toxic', item)
            return item.users.includes(username);
        });

    });
}

async function getAsosItem(productId) {
    console.log("getAllItems");
    mongooseConnect();

    return await AsosProductsModel.find({ productId: productId }).then(d => {
        mongoose.disconnect().then(d => {
            console.log("conection closed ");
        });
        return d;
    });
}

async function deleteAsosItem(productData, username, callback) {
    console.log("we get to delete");
    mongooseConnect();

    return await AsosProductsModel.remove({ productId: productData.productId }).then(r => {
        console.log("removed", r);
        callback();

        mongoose
            .disconnect()
            .then(d => {
                console.log("conection closed ");
            })
            .catch(e => {
                console.log("we got an error here", e);
            });
    }
    );
}

const asosDBManager = {
    checkAsosProductInDB: checkAsosProductInDB,
    addAsosProductToDB: addAsosProductToDB,
    updateAsosProductInDB: updateAsosProductInDB,
    getAllAsosItems: getAllAsosItems,
    getAsosItem: getAsosItem,
    deleteAsosItem: deleteAsosItem
};
module.exports = asosDBManager;