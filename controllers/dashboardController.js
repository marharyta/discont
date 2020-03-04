const asosDBManager = require("../database/mongodb/asosProducts");
const url = require("url");
const axios = require("axios");
const { detectOnlineStore, checkAsosItemInDB } = require("../utils");

function getDashboard(req, res) {
    async function getItems(user) {
        let saleItems = [];
        saleItems = await asosDBManager.getAllAsosItems(user);

        res.render("index", {
            saleItems: saleItems,
            user: req.session.user,
            username: req.session.user,
            productExists: false,
            productLoading: false
        });

    }

    if (req.session.user) {
        getItems(req.session.user);
    } else {
        res.redirect("/login");
    }
}

function getDashboardItem(req, res) {
    async function getSingleItem(item) {
        let saleItems = [];
        saleItems = await asosDBManager.getAsosItem(item);
        res.render("sale", {
            saleItems: saleItems,
            productExists: req.query.productExists ? true : false
        });
    }

    console.log("req.session.userName", req.session);
    if (req.session.user) {
        getSingleItem(req.params.itemId);
    } else {
        res.redirect("/login");
    }
}

async function deleteDashboardItem(req, res) {
    asosDBManager.deleteAsosItem({ productId: req.params.itemId }, req.session.user, () => res.redirect('/asosItems'));
}

async function addUrl(req, res) {
    // get url from request
    const url1 = url.parse(req.body.url);
    const storePrint = detectOnlineStore(url1.host);

    if (storePrint === "asos") {
        const itemChecked = await checkAsosItemInDB(
            url1.href,
            data => {
                asosDBManager.updateAsosProductInDB(data, req.session.user);
                res.redirect(`/asosItems/${data.productId}?productExists=true`);
            },
            () => {
                makeRequest();
            }
        );
    } else if (storePrint === "zalando") {
        res.end("Not supported");
    } else {
        res.end("Not supported");
    }

    // TODO: refactor this later
    function makeRequest() {
        axios
            .post("http://localhost:1555/asosItemUrl", {
                url: url1,
                name: req.session.user ? req.session.user : "undefined user"
            })
            .then(function (res) {
                res.redirect("/asosItems");
            })
            .catch(e => {
                console.log("error ", e);
            });
    }
}


module.exports = {
    getDashboard,
    getDashboardItem,
    deleteDashboardItem,
    addUrl
}