const express = require('express')
const {
  getAllExample,
  createExample
} = require('../controllers/exampleController')
const { auth, restrictedTo } = require('../middlewares/authMiddlewares')

const router = express.Router()

router
  .route('/example')
  .get(getAllExample)
  .post(auth, restrictedTo('admin'), createExample)

module.exports = router
