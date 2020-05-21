const React = require("react");
import { Helmet } from "react-helmet";

function LoginPage(props) {
  return (
    <div class="container">
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
      <h1>Login</h1>

      <form method="POST" action="/login">
        <input
          type="text"
          name="login"
          id="login"
          size="100"
          class="form-control"
        />

        <input
          type="text"
          name="password"
          id="password"
          size="100"
          class="form-control"
        />

        <input type="submit" value="OK" id="sumit" class="btn btn-default" />
      </form>
      <p>
        or <a href="/signup">Sign Up</a>
      </p>
    </div>
  );
}

module.exports = LoginPage;
