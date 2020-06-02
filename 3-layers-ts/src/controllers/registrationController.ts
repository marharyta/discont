const registerPerson = require("../database/mongodb/register");

export const getRegistration = (req, res, next) => {
  res.render("signup");
};

export const postRegistration = (req, res, next) => {
  const username = req.body.login;
  const password = req.body.password;
  registerPerson(username, password).then(data => {
    // create session here
    req.session.user = username;
    res.redirect("/login");
  }).cach(err => {
    next(err);
  });
};
