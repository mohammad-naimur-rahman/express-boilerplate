const Example = require('../models/exampleModel')
const { handleGetAll, handleCreateOne } = require('../utils/APIFactory')

exports.createExample = handleCreateOne(Example)
exports.getAllExample = handleGetAll(Example)
