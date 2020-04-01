const React = require('react');

function IndexPage(props) {
    return (
        <div className="container">
            <div className="row">
                {props.productExists ? (
                    <div className="col-sm-12">
                        Product exists already
                    </div>
                ) : null}
            </div>
            <div>
                {props.productLoading ?
                    <p className="danger">
                        product loading
                    </p>
                    : null}
            </div>
            <h1>Get your favourite fashion items with a discount!</h1>
            <h2>Input the URL of the item you like and check out the discounts!</h2>

            <p> {props.username}</p>

            <a href='/logout'>Log out</a>
            <a href='/signup'>Sign Up</a>

            <form method="POST" action="/asosItemUrl">
                <input type="url" name="url" id="url" placeholder="https://example.com" size="100" pattern="https://.*"
                    className="form-control" />

                <input type="submit" value="OK" id="sumit" className="btn btn-default" />
            </form>

            <div className="row">
                {saleItems.forEach(function (item) {
                    return (
                        <div className="col-sm-4">
                            <a href={"/asosItems/" + item.productId}
                                className={item.calculatedDiscount > 0 ? "text-danger" : "text-info"} target="_blank">
                                <img src={item.images[0]} className={item.calculatedDiscount > 0 ? "danger" : " "} />
                                <h5> {item.productTitle} </h5>
                                <h5> {item.calculatedDiscount} </h5>
                            </a>
                            <a href={item.productURL} className={item.calculatedDiscount > 0 ? "text-danger" : "text-info"}
                                target="_blank">link</a>
                            <form method="POST" action={"/asosItems/" + item.productId}>
                                <input id="item_id" type="hidden" name="item_id" value={item.productId} />
                                <input type="submit" value="Delete" />
                            </form>
                        </div>);
                })}
            </div >
        </div >);
}

module.exports = IndexPage;