const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config");

const dbManager = require("../loginMongoDBManager");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

//TODO
router.post("/register", function(req, res) {
  const hashedPassword = bcrypt.hashSync(req.body.password, 8);

  dbManager
    .signUpPerson(username, password)
    .then(d => {
      console.log("DATA from the registration", d);
      // create session here
      //   req.session.user = username;
      // const token = jwt.sign({ id: user._id }, config.secret, {
      //   expiresIn: 86400 // expires in 24 hours
      // });
      //   res.status(200).send({ auth: true, token: token });
      res.redirect("/login");
    })
    .catch(e => {
      return res.status(500).send("There was a problem registering the user.");
    });

  User.create(
    {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    },
    function(err, user) {
      if (err)
        return res
          .status(500)
          .send("There was a problem registering the user.");
      // create a token
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });
      res.status(200).send({ auth: true, token: token });
    }
  );
});
