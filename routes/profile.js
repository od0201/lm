const {Router} = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')
const router = Router()

router.get('/', auth, async (req, res) => {
  res.render('profile', {
    title: 'Профиль',
    isProfile: true,
    user: req.user.dataValues
  })
})

router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)

    const toChange = {
      first_name: req.body.first_name,
      last_name: req.body.last_name
    }
     console.log(req.file)
    if (req.file) {
      toChange.avatarUrl = req.file.filename
    }

    Object.assign(user, toChange)


    await user.save()
    res.redirect('/profile')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router