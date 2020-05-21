import { loginPerson } from "../database/mongodb/login";

export const getLogin = (req, res) => {
  res.render("login", {
    logoutStataus: false
  });
};

export const postLogin = (req, res) => {
  const username = req.body.login;
  const password = req.body.password;
  console.log("postLogin", username, password);
  loginPerson(username, password)
    .then(() => {
      console.log("req.session.user", username);
      req.session.userName = username;
      req.session.user = username;
      res.redirect("/asosItems");
    })
    .catch(e => {
      console.log(e);
      res.end("Invalid credentials", e);
    });
};
