const React = require("react");
import { Helmet } from "react-helmet";

function IndexPage(props) {
  return (
    <React.Fragment>
      <Helmet>
        <meta charSet="utf-8" />
        <title>My Title</title>
        <meta charset="UTF-8" />
        <title>Discont</title>

        <link
          rel="stylesheet"
          href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css"
        />
        <link rel="stylesheet" href="/assets/style.css" type="text/css" />
      </Helmet>
      <div className="container">
        <div>
          {props.productLoading ? (
            <p className="danger">product loading</p>
          ) : null}
        </div>
        <h1>Get your favourite fashion items with a discount!</h1>
        <h2>Input the URL of the item you like and check out the discounts!</h2>

        <p> {props.username}</p>

        <a href="/logout">Log out</a>
        <a href="/signup">Sign Up</a>

        <form method="POST" action="/asosItemUrl">
          <input
            type="url"
            name="url"
            id="url"
            placeholder="https://example.com"
            size="100"
            pattern="https://.*"
            className="form-control"
          />

          <input
            type="submit"
            value="OK"
            id="sumit"
            className="btn btn-default"
          />
        </form>

        <div className="row">
          {props.saleItems.forEach(function(item) {
            console.log("props.saleItems item ", item);

            <div className="col-sm-4">
              <h5> {item.productTitle} </h5>
              <h5> {item.calculatedDiscount} </h5>
              {/* <a
                href={"/asosItems/" + item.productId}
                className={
                  item.calculatedDiscount > 0 ? "text-danger" : "text-info"
                }
                target="_blank"
              > */}
              {/* <img
                  src={item.images[0]}
                  className={item.calculatedDiscount > 0 ? "danger" : " "}
                /> */}
              {/* </a> */}
              {/* <a
                href={item.productURL}
                className={
                  item.calculatedDiscount > 0 ? "text-danger" : "text-info"
                }
                target="_blank"
              >
                link
              </a> */}
              {/* <form method="POST" action={"/asosItems/" + item.productId}>
                <input
                  id="item_id"
                  type="hidden"
                  name="item_id"
                  value={item.productId}
                />
                <input type="submit" value="Delete" />
              </form> */}
            </div>;
          })}
        </div>
      </div>
    </React.Fragment>
  );
}

module.exports = IndexPage;
