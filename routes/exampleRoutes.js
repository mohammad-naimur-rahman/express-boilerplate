const express = require('express')
const {
  getAllExample,
  createExample
} = require('../controllers/exampleController')
const { auth, restrictedTo } = require('../middlewares/authMiddlewares')

const router = express.Router()

router
  .use('/example')
  .get(getAllExample)
  .post(auth, restrictedTo('admin'), createExample)
