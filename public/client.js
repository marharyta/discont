// var clothingItems = JSON.parse(
//   localStorage.getItem("items").replace(/&#34;/g, '"')
// );

// console.log("items", clothingItems, clothingItems.length);

// var hello = JSON.parse(test.replace(/&#34;/g, '"'));
// console.log("hello", hello);
// document.getElementById("spinner").style.display = "none";
// document.getElementById("sumit").addEventListener("click", function() {
//   console.log("it works");
//   document.getElementById("spinner").style.display = "block";
//   console.log("it works block", document.getElementById("spinner"));
// });

fetch("/getItems")
  .then(function(response) {
    return response.json();
  })
  .then(d => {
    console.log("we got data", d);
  })
  .catch(e => console.log("error here", e));

// import React from "react";
// import ReactDOM from "react-dom";
