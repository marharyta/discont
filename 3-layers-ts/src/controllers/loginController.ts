import { loginPerson } from "../database/mongodb/login";

export const getLogin = (req, res, next) => {
  res.render("login", {
    logoutStataus: false
  });
};

export const postLogin = (req, res, next) => {
  const username = req.body.login;
  const password = req.body.password;
  loginPerson(username, password)
    .then(() => {
      console.log("req.session.user", username);
      req.session.userName = username;
      req.session.user = username;
      res.redirect("/asosItems");
    })
    .catch(err => {
      next(err);
      res.end("Invalid credentials", err);
    });
};
