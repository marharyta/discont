const loginPerson = require("../database/mongodb/login")

function getLogin(req, res) {
    res.render("login", {
        logoutStataus: false
    });
}

function postLogin(req, res) {
    const username = req.body.login;
    const password = req.body.password;

    loginPerson(username, password)
        .then(d => {
            req.session.userName = username;
            req.session.user = username;
            res.redirect("/asosItems");
        })
        .catch(e => {
            res.end("Invalid credentials");
        });
}

module.exports = {
    getLogin,
    postLogin
}