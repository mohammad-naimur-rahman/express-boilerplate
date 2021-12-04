const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const compression = require('compression')

const HandleError = require('./error/handleError.js')
const GlobalErrorHandler = require('./error/errorController')

const exampleRouter = require('./routes/exampleRoutes')
// ^^ END OF IMPORTS ^^ //

const app = express()

app.enable('trust proxy')

//-- Global Middlewares

app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

// For optimization and security
if (!process.env.ALLOWED_ORIGIN) app.use(cors())
else app.use(cors({ origin: process.env.ALLOWED_ORIGIN }))
app.options('*', cors())
app.use(helmet())
app.use(mongoSanitize())
app.use(xss())
app.use(compression())
app.use(
  hpp({
    whitelist: ['price']
  })
)

if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'))

const limiter = rateLimit({
  max: process.env.RATE_LIMIT_MAX || 100,
  windowMs: process.env.RATE_LIMIT_TIME
    ? process.env.RATE_LIMIT_TIME * 60 * 1000
    : 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
})

app.use('/api', limiter)

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})

const init = (res, res) => res.send('I am on')

//-- Route Handlerr
app.use('/', init)
app.use('/api/v1/example', exampleRouter)

//-- For Undeclared Routes
app.all('*', (req, res, next) => {
  next(new HandleError(`Can't find ${req.originalUrl} on this server!`, 404))
})

//-- Error Handler for undeclared routes
app.use(GlobalErrorHandler)

module.exports = app
