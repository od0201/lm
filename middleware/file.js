const multer = require('multer')
const User = require('../models/user')


const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'images\\avatar')
  },
  filename(req, file, cb) {
    cb(null, req.session.user.id + '-' + file.originalname)
  }
})

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

module.exports = multer({
  storage, fileFilter
})