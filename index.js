const express = require('express')
const path = require('path')
const csrf = require('csurf')
const flash = require('connect-flash')
const sequelize = require('./utils/database')
const helmet = require('helmet')
const compression = require('compression')
const exphbs = require('express-handlebars')
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session);
const homeRoutes = require('./routes/home')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')
const ncNewLetters = require('./routes/nc/newLetters')
const ncCorrespondence = require('./routes/nc/correspondence')
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const errorHandler = require('./middleware/error')
const fileMiddleware = require('./middleware/file')
const keys = require('./keys')


const PORT = process.env.PORT || 3000

const app = express()
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: require('./utils/hbs-helpers')
})

var options = {
	host: keys.MYSQL_HOST,
	database: keys.MYSQL_NAME,
	user: keys.MYSQL_USER,
	password: keys.MYSQL_PASSWORD,
};

var sessionStore = new MySQLStore(options);

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended: true}))
app.use(session({
  cookie: {maxAge: 864000000}, // 10 days
  secret: keys.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  //store //for mongoDB
  store:sessionStore,
}))

app.use(fileMiddleware.single('avatar'))
app.use(csrf())
app.use(flash())
app.use(helmet())
app.use(compression())
app.use(varMiddleware)
app.use(userMiddleware)


app.use('/', homeRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)
app.use('/nc/newLetters', ncNewLetters)
app.use('/nc/correspondence', ncCorrespondence)



app.use(errorHandler)

async function start() {
  try {
    await sequelize.sync()
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (e) {
    console.log(e)
  }
}

start()


