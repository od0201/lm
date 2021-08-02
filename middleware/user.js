const User = require('../models/user')

module.exports = async function(req, res, next) {
  if (!req.session.user) {
    return next()
  }

  req.user = await User.findByPk(req.session.user.id)
  next()
}