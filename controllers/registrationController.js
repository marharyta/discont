const registerPerson = require("../database/mongodb/register");

function getRegistration(req, res) {
    res.render("signup");
}

function postRegistration(req, res) {
    var username = req.body.login,
        password = req.body.password;
    registerPerson(username, password).then(d => {
        // create session here
        req.session.user = username;
        res.redirect("/login");
    });
}


module.exports = {
    getRegistration,
    postRegistration
}