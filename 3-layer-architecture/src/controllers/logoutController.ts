export function getLogout(req, res) {
  res.render("login", {
    logoutStataus: false
  });
}
