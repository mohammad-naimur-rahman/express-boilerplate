const HandleError = require('../error/handleError')
const { createSignToken } = require('../utils/authHandler')
const HandleAsync = require('../utils/handleAsync')
const User = require('./../models/userModel')

exports.signup = HandleAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email
  })

  req.user = user

  createSignToken(user, 201, req, res)
})

exports.login = HandleAsync(async (req, res, next) => {
  const { email } = req.body

  // 1) Check if email and password exist
  if (!email) {
    return next(new HandleError('Please provide email and password', 400))
  }

  // 2) Check if the user exists && password is correct
  const user = await User.findOne({ email })

  req.user = user

  if (!user) {
    return next(new HandleError('Incorrect email or password', 401))
  }

  //3) If everything ok, send token to client
  createSignToken(user, 200, req, res)
})
