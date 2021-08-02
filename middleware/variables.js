module.exports = function(req, res, next) {
  res.locals.nick = (req.session.isAuthenticated)?req.session.user.nick:'guest'
  res.locals.isAuth = req.session.isAuthenticated
  res.locals.csrf = req.csrfToken()  
  next()
}
