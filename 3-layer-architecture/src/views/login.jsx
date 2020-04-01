const React = require('react');

function LoginPage(props) {
    return (
        <div className="container">

            <h1>Login</h1>
            <h2>{props.logoutStataus === true ? "you are logged out" : "log in now"}</h2>

            <form method="POST" action="/login">
                <input type="text" name="login" id="login" size="100" className="form-control" />

                <input type="text" name="password" id="password" size="100" className="form-control" />

                <input type="submit" value="OK" id="sumit" className="btn btn-default" />
            </form>
            <p>or <a href='/signup'>Sign Up</a></p>
        </div>);
}

module.exports = LoginPage;