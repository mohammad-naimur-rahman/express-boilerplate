const HandleAsync = require('./handleAsync')
const HandleError = require('./../error/handleError')
const GetAllFeatures = require('./getAllFeatures')

exports.handleDeleteOne = Model =>
  HandleAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) {
      return next(new HandleError('No document found with that ID', 404))
    }

    res.status(204).json({
      status: 'success',
      data: null
    })
  })

exports.handleUpdateOne = Model =>
  HandleAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    if (!updatedDoc) {
      return next(new HandleError('No document found with that ID', 404))
    }

    res.status(201).json({
      status: 'success',
      data: { data: updatedDoc }
    })
  })

exports.handleCreateOne = Model =>
  HandleAsync(async (req, res, next) => {
    const doc = await Model.create(req.body)
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    })
  })

exports.handleGetOne = (Model, populateOptions) =>
  HandleAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (populateOptions) query = query.populate(populateOptions)

    const doc = await query

    if (!doc) {
      return next(new HandleError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'success',
      data: { data: doc }
    })
  })

exports.handleGetAll = Model =>
  HandleAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {}

    if (req.params.tourId) {
      filter = { tour: req.params.tourId }
    }
    //-- Execute the query
    const features = new GetAllFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
    const doc = await features.query

    //-- Send Response
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: { data: doc }
    })
  })
