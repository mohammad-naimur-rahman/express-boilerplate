const HandleError = require('./handleError')

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    })
  }
}

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      })
    }
    console.error('ERROR 💥', err)
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    })
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res)
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }
    error.message = err.message
    if (error.name === 'CastError')
      error = new HandleError(`Invalid ${error.path}: ${error.value}`, 400)

    if (error.code === 11000)
      error = new HandleError('Duplicate field value', 400)

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(el => el.message)
      error = new HandleError(`Invalid input data. ${errors.join(', ')}`, 400)
    }

    if (error.name === 'jsonWebTokenError') {
      error = new HandleError('Invalid token', 401)
    }

    if (error.name === 'TokenExpiredError') {
      error = new HandleError('Token expired', 401)
    }

    sendErrorProd(error, req, res)
  }
}
