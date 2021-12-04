const HandleError = require('../error/handleError')
const { createSignToken } = require('../utils/authHandler')
const HandleAsync = require('../utils/handleAsync')
const User = require('./../models/userModel')
const CryptoJS = require('crypto-js')

/*
In this express app, authentication will be handled by firebase and JWT will be handled by this app.
That's why there is no password field in the user model. and also in signup and login.
So, if there is no verification, any user can login without firebase login...
To prevent this, I have made a plan to make a verification process.

A SIGN_SECRET_KEY will be present both in the sever and in the client.
As the secret key will be kept in the environment variable (both in frontend and backend), it will not be exposed to anyone.
In the frontend, the secret key will be encrypted using CryptoJS with the email of the user.
And will be sent in the header,
and in the server, we will verify the secret key and decrypt it.
If verified, we will send the user object to the frontend.
And thus no user will be able to login without firebase login.
for more details, see the following link: https://www.code-sample.com/2019/12/react-encryption-decryption-data-text.html

or follow this-->
yarn add crypto-js

In the frontend->
const CryptoJS = require("crypto-js"); // yes, you have to use this require system in the frontend.

while sending POST request from the frontend (after completing firebase login, signup or logout)->
const sign_secret = CryptoJS.AES.encrypt(JSON.stringify(<user_email>), <process.env.SIGN_SECRET_KEY>).toString();
This sign_secret will be sent in the header.

In the backend->
You are seeing that we are decrypting the sign_secret in the server.
and verifying the user.
*/

exports.signup = HandleAsync(async (req, res, next) => {
  const { name, email } = req.body
  const bytes = CryptoJS.AES.decrypt(
    req.headers.sign_secret,
    process.env.SIGN_SECRET_KEY
  )
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))

  if (decryptedData !== email) {
    return next(new HandleError('Please signup with firebase first', 400))
  }

  const user = await User.create({
    name,
    email
  })

  createSignToken(user, 201, req, res)
})

exports.login = HandleAsync(async (req, res, next) => {
  const { email } = req.body

  const bytes = CryptoJS.AES.decrypt(
    req.headers.sign_secret,
    process.env.SIGN_SECRET_KEY
  )
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))

  if (!email) {
    return next(new HandleError('Please provide email and password', 400))
  }

  if (decryptedData !== email) {
    return next(new HandleError('Please login with firebase first', 400))
  }

  const user = await User.findOne({ email })

  if (!user) {
    return next(new HandleError('Incorrect email or password', 401))
  }

  createSignToken(user, 200, req, res)
})

exports.logout = HandleAsync(async (req, res, next) => {
  const { email } = req.body
  const bytes = CryptoJS.AES.decrypt(
    req.headers.sign_secret,
    process.env.SIGN_SECRET_KEY
  )
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))

  if (decryptedData !== email) {
    return next(new HandleError('Please logout with firebase first', 400))
  }

  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })
  res.status(200).json({ status: 'success' })
})
