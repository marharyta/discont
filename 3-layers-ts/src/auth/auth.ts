const checkSignIn = (err, req, res, next) => {
  if (err) {
    next(err);
  }
  if (req.session.user) {
    console.log("user session detected", req.session.user);
    next();
  } else {
    console.log("user session not detected");
    next();
  }
};

export default checkSignIn;
