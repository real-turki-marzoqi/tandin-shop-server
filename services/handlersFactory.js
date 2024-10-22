const ApiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");
const ApiFeatures = require("../utils/apiFeatures");

// @desc DELETE Specific DOCUMENT
// @route DELETE /api/v1/dicuments/:id
// access Private
exports.deleteOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document Found For This Id ${id}`), 400);
    }

    res.status(204).send();
  });

// @desc Update Specific DOCUMENT
// @route PUT /api/v1/doduments/:id
// access Private
exports.updateOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const document = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No Document Found For This Id ${req.params.id}`),
        400
      );
    }

    res.status(200).json({ data: document });
  });

// @desc GET Specific DOCUMENT By ID
// @route GET /api/v1/documents/:id
// access Public
exports.getOne = (model, populateOption) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // build querey
    let query = model.findById(id);

    if (populateOption) {
      query = query.populate(populateOption);
    }

    // excure query
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document Found For This ID ${id}`, 404));
    }

    res.status(200).json({ data: document });
  });

// @desc Create DOCUMENT
// @route POST /api/v1/documents
// access Private
exports.createOne = (model) =>
  asyncHandler(async (req, res) => {
    const document = await model.create(req.body);

    res.status(201).json({ data: document });
  });

// @desc GET List Of Documents
// @route GET /api/v1/documents
// access Public
exports.getAll = (Model, modelName = '') =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    // Build query
    const documentsCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });