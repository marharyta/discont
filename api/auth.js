
const router = require('./router');

module.exports = checkSignIn = (req, res, next) => {
    if (req.session.user) {
        console.log("user session detected", req.session.user);
        next(); //If session exists, proceed to page
    } else {
        const err = new Error("user session not detected");
        // res.redirect("/login");
        next();
    }
}

// router.get("/", (req, res) => {
//     if (req.session.user) {
//         res.redirect("/dashboard");
//     } else {
//         res.redirect('/login');
//     }
// });
