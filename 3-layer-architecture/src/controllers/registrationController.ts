const registerPerson = require("../database/mongodb/register");

export const getRegistration = (req, res) => {
  res.render("signup");
};

export const postRegistration = (req, res) => {
  const username = req.body.login;
  const password = req.body.password;
  registerPerson(username, password).then(d => {
    // create session here
    req.session.user = username;
    res.redirect("/login");
  });
};
