const {Router} = require('express')
const sequelize = require('sequelize')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const {validationResult} = require('express-validator/check')
const sendMail = require('../utils/nodemailer')
const User = require('../models/user')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const {body} = require('express-validator/check') 
const {resetValidators} = require('../utils/validators')
const {registerValidators} = require('../utils/validators')
const router = Router()


router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Авторизация',
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError')
  })
})

router.post('/login', async (req, res) => {
  try {
    const {nick, password} = req.body
    const candidate = await User.findOne({raw:true,  where: {nick:nick}} )
    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.pswCrypt)
      if (areSame) {
        req.session.user = candidate
        req.session.isAuthenticated = true
        req.session.save(err => {
          if (err) {
            throw err
          }
          res.redirect('/')
        })
      } else {
        req.flash('loginError', 'Неверный пароль')
        res.redirect('/auth/login#login')
      }
    } else {
      req.flash('loginError', 'Такого пользователя не существует')
      res.redirect('/auth/login#login')
    }
  } catch (e) {
    console.log(e)
  }
})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login')
  })
})

router.post('/register', registerValidators, async (req, res) => {
  try {
    const {nick,email, password} = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg)
      return res.status(422).redirect('/auth/login#register')
    }
    const hashPassword = await bcrypt.hash(password, 10)
    const user = new User({ nick,email,pswCrypt: hashPassword })
    await user.save()
    await sendMail(regEmail(email))
    res.redirect('/auth/login#login')
  } catch (e) {
    console.log(e)
  }
})

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'I forgot my password',
    error: req.flash('error')
  })
})

router.post('/reset', resetValidators, (req, res) => {  //body('email').normalizeEmail()
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg)
      return res.status(422).redirect('/auth/reset')
    }
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('error', 'Что-то пошло не так, повторите попытку позже')
        return res.redirect('/auth/reset')
      }
      const token = buffer.toString('hex')
      const candidate = await User.findOne({where: {email:req.body.email}} )
      if (candidate) {
        candidate.resetToken = token
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
        await candidate.save()
        await sendMail(resetEmail(candidate.email, token))
        req.flash('error', `на ${req.body.email} была отправлено письмо с инструкцией по восcтановлению пароля`)
        res.redirect('/auth/reset')
      } else {
        req.flash('error', 'Такого email нет')
        res.redirect('/auth/reset')
      }
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/password/:token', async (req, res) => {
  if (!req.params.token) {
    return res.redirect('/auth/login')
  }

  try {
    const user = await User.findOne({where: {
      resetToken: req.params.token,
      resetTokenExp: {[sequelize.Op.gt]: Date.now()}
    }})

    if (!user) {
      return res.redirect('/auth/login')
    } else {
      res.render('auth/password', {
        title: 'Восстановить доступ',
        error: req.flash('error'),
        userId: user.id.toString(),
        token: req.params.token
      })
    }
  } catch (e) {
    console.log(e)
  }
  
})

router.post('/password', async (req, res) => {
  try {
    const user = await User.findOne({where: {
      id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: {[sequelize.Op.gt]: Date.now()}
    }})

    if (user) {
      const psw=await bcrypt.hash(req.body.password, 10)
      console.log(psw)
      user.pswCrypt = psw
      user.resetToken = null
      user.resetTokenExp = null
      await user.save()
      res.redirect('/auth/login')
    } else {
      req.flash('loginError', 'Время жизни токена истекло')
      res.redirect('/auth/login')
    }
  } catch (e) {
    console.log(e)
  }
})

module.exports = router