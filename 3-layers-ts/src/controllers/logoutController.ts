export function getLogout(req, res, next) {
  res.render("login", {
    logoutStataus: false
  });
}
