"use strict";

const asosDBManager = require("../database/mongodb/asosProducts");

function detectOnlineStore(url) {
  // regex for store domains
  const asosRegex = /asos/g;
  const zalandoRegex = /zalando/g;
  const nastygalRegex = /nastygal(?=\.com)/g;
  const stockmannRegex = /zalando/g; // check if link is from any supported website

  const isAsos = asosRegex.test(url);
  const isZalando = zalandoRegex.test(url);
  const isNastygal = nastygalRegex.test(url); // throw error if cannot find any website

  if (!isAsos && !isZalando && !isNastygal) {
    return "not found";
  } else if (isAsos) {
    return "asos";
  } else if (isZalando) {
    return "zalando";
  }
}

async function checkAsosItemInDB(url, callback1, callback2) {
  console.log("checkItem");
  const extractProductId = /(?:\/prd\/)\d{3,50}(?=\?)/g;
  const extractProductIdNumber = /\d{3,50}/g;
  const productIdArray = extractProductId.exec(url);
  const productId = extractProductIdNumber.exec(productIdArray[0])[0];

  if (!Number.isInteger(parseInt(productId))) {
    // catch an error
    throw new Error("product ID not detected");
    return null;
  }

  await asosDBManager.checkAsosProductInDB({
    productId: productId
  }, function (data) {
    if (data !== null && data !== undefined) {
      callback1(data);
    } else {
      console.log("it does not exist");
      callback2();
      return null;
    }
  });
}

module.exports = {
  detectOnlineStore,
  checkAsosItemInDB
};