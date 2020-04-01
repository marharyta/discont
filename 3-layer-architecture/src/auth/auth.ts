const checkSignIn = (req, res, next) => {
  if (req.session.user) {
    console.log("user session detected", req.session.user);
    next();
  } else {
    console.log("user session not detected");
    next();
  }
};

export default checkSignIn;
