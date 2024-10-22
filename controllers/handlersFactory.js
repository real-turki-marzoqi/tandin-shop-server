const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');



exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      next(
        new ApiError(`No document found for this id: ${req.params.id}`, 404)
      );
    }
  
    
    // 204 no content
    res.status(204).send();
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document found for this id: ${req.params.id}`, 404)
      );
    }

    // To trigger 'save' event when update document
    const doc = await document.save();

   
    res.status(200).json({ data: doc });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(req.body);

    
    res.status(201).json({ data: newDoc });
  });

exports.getOne = (Model, populateOpts) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // Build query
    let query = Model.findById(id);
    if (populateOpts) query = query.populate(populateOpts);

    // Execute query
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    res.status(200).json({ data: document });
  });

exports.getAll = (Model, modelName = '') =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObject) {
      filter = req.filterObject;
    }

    // Build query
    // const documentsCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();
    // .paginate();

    // Apply pagination after filer and search
    const docsCount = await Model.countDocuments(apiFeatures.mongooseQuery);
    apiFeatures.paginate(docsCount);

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    // Set Images url
   
    res
      .status(200)
      .json({ results: docsCount, paginationResult, data: documents });
  });

exports.deleteAll = (Model) =>
  asyncHandler(async (req, res, next) => {
    await Model.deleteMany();
    // 204 no content
    res.status(204).send();
  });
