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
    console.log("delete path works");
    const url1 = req.body.item_id;
    console.log('request params', url1);
    asosDBManager.deleteAsosItem({ productId: url1 }, req.session.user, () => res.redirect('/dashboard'));
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
                res.redirect(`/dashboard/${data.productId}?productExists=true`);
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
            .post("http://localhost:1555/addUrl", {
                url: url1,
                name: req.session.user ? req.session.user : "undefined user"
            })
            .then(function (response) {
                res.redirect("/dashboard");
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