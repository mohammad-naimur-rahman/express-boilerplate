const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const HandleAsync = require('./../utils/handleAsync')
const HandleError = require('./../error/handleError')

exports.auth = HandleAsync(async (req, res, next) => {
  const token = req.cookies.jwt

  if (!token) {
    return next(
      new HandleError('You are not logged in! Please log in to get access', 401)
    )
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY)

  const currentUser = await User.findById(decoded.id)
  if (!currentUser) {
    return next(
      new HandleError(
        'The user belonging to this token does no longer exist',
        401
      )
    )
  }

  req.user = currentUser
  next()
})

exports.restrictedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new HandleError(
          'You do not have permission to perform this action',
          403
        )
      )
    }
    next()
  }
}
