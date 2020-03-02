const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
    if (req.session.user) {
        res.redirect("/dashboard");
    } else {
        res.redirect('/login');
    }
});

module.exports = router;