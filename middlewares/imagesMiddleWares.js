/* eslint-disable no-shadow */
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../utils/cloudinary");
const ApiError = require("../utils/apiError");

exports.deleteImage = (model, modelName, FolderName) =>
  asyncHandler(async (req, res, next) => {
    const document = await model.findById(req.params.id);

    if (!document) {
      return next(
        new ApiError(
          `No document found for this ${modelName} (Id: ${req.params.id})`,
          404
        )
      );
    }

    if (document.image) {
      const imageUrl = document.image;

      const getPublicId = (imageUrl) => {
        const parts = imageUrl.split("/");
        const lastPart = parts.pop();
        const publicId = lastPart.split(".")[0];
        return `Tandn-shop/${FolderName}/${publicId}`;
      };

      const publicId = getPublicId(imageUrl);

      if (!publicId) {
        return next(
          new ApiError(`Invalid public_id format (Id: ${req.params.id})`, 400)
        );
      }

      try {
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === "ok") {
          next();
        } else {
          return next(
            new ApiError(
              `Failed to delete image from Cloudinary ${result}`,
              500
            )
          );
        }
      } catch (error) {
        return next(
          new ApiError(
            `Error deleting image from Cloudinary ${error.message}`,
            500
          )
        );
      }
    } else {
      next();
    }
  });

exports.ImageProcessing = (modelName, folderName) =>
  asyncHandler(async (req, res, next) => {
    if (req.file && req.file.buffer) {
      const filename = `${modelName}-${uuidv4()}-${Date.now()}.png`;
      const publicId = filename.split(".")[0]; // استخدام اسم الصورة بدون الامتداد

      try {
        const processedImageBuffer = await sharp(req.file.buffer)
          .toFormat("png")
          .png({ quality: 90 })
          .toBuffer();

        const cloudinaryResponse = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              public_id: publicId, // تعيين public_id
              folder: `Tandn-shop/${folderName}`,
            },
            (error, result) => {
              if (error) {
                reject(new Error("Error uploading image using Cloudinary"));
              } else {
                resolve(result);
              }
            }
          );
          stream.end(processedImageBuffer);
        });

        req.body.image = cloudinaryResponse.secure_url;
        next();
      } catch (error) {
        return next(new ApiError("Image Processing Error", 500));
      }
    } else {
      next();
    }
  });

exports.updateImage = (model, modelName, folderName) =>
  asyncHandler(async (req, res, next) => {
    const document = await model.findById(req.params.id);
    if (!document) {
      return next(new ApiError(`No ${modelName} found for this ID`, 404));
    }

    if (req.file && req.file.buffer) {
      const imageUrl = document.image;

      const getPublicId = (imageUrl) => {
        const parts = imageUrl.split("/");
        const lastPart = parts.pop();
        const publicId = lastPart.split(".")[0];
        return `Tandn-shop/${folderName}/${publicId}`;
      };

      if (imageUrl) {
        const publicId = getPublicId(imageUrl);
        try {
          const result = await cloudinary.uploader.destroy(publicId);
          if (result.result !== "ok") {
            return next(
              new ApiError(
                `Failed to delete image from Cloudinary: ${result.result}`,
                500
              )
            );
          }
        } catch (error) {
          return next(
            new ApiError(
              `Error deleting image from Cloudinary: ${error.message}`,
              500
            )
          );
        }
      }

      const filename = `${modelName}-${uuidv4()}-${Date.now()}.png`;
      const newPublicId = filename.split(".")[0];

      try {
        const processedImageBuffer = await sharp(req.file.buffer)
          .toFormat("png")
          .png({ quality: 90 })
          .toBuffer();

        const cloudinaryResponse = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              public_id: newPublicId,
              folder: `Tandn-shop/${folderName}`,
            },
            (error, result) => {
              if (error) {
                reject(new Error("Error uploading image using Cloudinary"));
              } else {
                resolve(result);
              }
            }
          );
          stream.end(processedImageBuffer);
        });

        document.image = cloudinaryResponse.secure_url;
        await document.save();
        next();
      } catch (error) {
        return next(new ApiError("Image Processing Error", 500));
      }
    } else {
      next();
    }
  });

exports.resizeProductImages = (modelName, folderName) =>
  asyncHandler(async (req, res, next) => {
    if (req.files.imageCover && req.files.imageCover[0].buffer) {
      const imageCoverFileName = `${modelName}-${uuidv4()}-${Date.now()}-cover.png`;
      const publicIdCover = imageCoverFileName.split(".")[0];

      try {
        const processedImageCoverBuffer = await sharp(
          req.files.imageCover[0].buffer
        )
          .toFormat("png")
          .png({ quality: 95 })
          .toBuffer();

        const cloudinaryResponseCover = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              public_id: publicIdCover,
              folder: `Tandn-shop/${folderName}`,
            },
            (error, result) => {
              if (error) {
                console.error(
                  "Error uploading imageCover to Cloudinary:",
                  error
                );
                reject(new Error("Error uploading imageCover to Cloudinary"));
              } else {
                resolve(result);
              }
            }
          );
          stream.end(processedImageCoverBuffer);
        });

        req.body.imageCover = cloudinaryResponseCover.secure_url;
      } catch (error) {
        return res
          .status(500)
          .json({ message: error.message || "ImageCover Processing Error" });
      }
    }

    if (req.files.images) {
      req.body.images = [];

      await Promise.all(
        req.files.images.map(async (img, index) => {
          if (img.buffer) {
            const imageName = `${modelName}-${uuidv4()}-${Date.now()}-${
              index + 1
            }.png`;
            const publicIdImage = imageName.split(".")[0];

            try {
              const processedImageBuffer = await sharp(img.buffer)
                .toFormat("png")
                .png({ quality: 95 })
                .toBuffer();

              const cloudinaryResponseImage = await new Promise(
                (resolve, reject) => {
                  const stream = cloudinary.uploader.upload_stream(
                    {
                      public_id: publicIdImage,
                      folder: `Tandn-shop/${folderName}`,
                    },
                    (error, result) => {
                      if (error) {
                        console.error(
                          `Error uploading image ${index + 1} to Cloudinary:`,
                          error
                        );
                        reject(
                          new Error(
                            `Error uploading image ${index + 1} to Cloudinary`
                          )
                        );
                      } else {
                        resolve(result);
                      }
                    }
                  );
                  stream.end(processedImageBuffer);
                }
              );

              req.body.images.push(cloudinaryResponseImage.secure_url);
            } catch (error) {
              return res
                .status(500)
                .json({ message: error.message || "Image Processing Error" });
            }
          }
        })
      );
    }

    next();
  });

exports.deleteProductCoverImageAndImages = (model, modelName, folderName) =>
  asyncHandler(async (req, res, next) => {
    const document = await model.findById(req.params.id);

    if (!document) {
      return next(
        new ApiError(
          `No ${modelName} found with this ID: ${req.params.id}`,
          404
        )
      );
    }

    const getPublicId = (imageUrl) => {
      const parts = imageUrl.split("/");
      const lastPart = parts.pop();
      const publicId = lastPart.split(".")[0];
      return `Tandn-shop/${folderName}/${publicId}`;
    };

    if (document.imageCover) {
      const imageCoverUrl = document.imageCover;
      const publicId = getPublicId(imageCoverUrl);

      if (!publicId) {
        return next(
          new ApiError(`Invalid public_id format (Id: ${req.params.id})`, 400)
        );
      }

      try {
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== "ok") {
          return next(
            new ApiError(
              `Failed to delete imageCover from Cloudinary: ${JSON.stringify(
                result
              )}`,
              500
            )
          );
        }
      } catch (error) {
        return next(
          new ApiError(
            `Error deleting imageCover from Cloudinary: ${
              error.message || JSON.stringify(error)
            }`,
            500
          )
        );
      }
    }

    if (document.images && document.images.length > 0) {
      await Promise.all(
        document.images.map(async (imageUrl) => {
          const publicId = getPublicId(imageUrl);

          if (!publicId) {
            return next(
              new ApiError(
                `Invalid public_id format for one of the images (Id: ${req.params.id})`,
                400
              )
            );
          }

          try {
            const result = await cloudinary.uploader.destroy(publicId);

            if (result.result !== "ok") {
              return next(
                new ApiError(
                  `Failed to delete image from Cloudinary: ${JSON.stringify(
                    result
                  )}`,
                  500
                )
              );
            }
          } catch (error) {
            return next(
              new ApiError(
                `Error deleting image from Cloudinary: ${
                  error.message || JSON.stringify(error)
                }`,
                500
              )
            );
          }
        })
      );
    }

    next();
  });

exports.updateProductImages = (model, modelName, folderName) =>
  asyncHandler(async (req, res, next) => {
    const document = await model.findById(req.params.id);

    if (!document) {
      return next(
        new ApiError(
          `No ${modelName} found with this ID: ${req.params.id}`,
          404
        )
      );
    }

    const getPublicId = (imageUrl) => {
      const parts = imageUrl.split("/");
      const lastPart = parts.pop();
      const publicId = lastPart.split(".")[0];
      return `Tandn-shop/${folderName}/${publicId}`;
    };

    if (document.imageCover && req.files.imageCover) {
      const imageCoverUrl = document.imageCover;
      const publicId = getPublicId(imageCoverUrl);

      if (publicId) {
        try {
          const result = await cloudinary.uploader.destroy(publicId);
          if (result.result !== "ok") {
            return next(
              new ApiError(
                `Failed to delete imageCover from Cloudinary: ${JSON.stringify(
                  result
                )}`,
                500
              )
            );
          }
        } catch (error) {
          return next(
            new ApiError(
              `Error deleting imageCover from Cloudinary: ${error.message}`,
              500
            )
          );
        }
      }
    }

    if (document.images && document.images.length > 0 && req.files.images) {
      await Promise.all(
        document.images.map(async (imageUrl) => {
          const publicId = getPublicId(imageUrl);
          if (publicId) {
            try {
              const result = await cloudinary.uploader.destroy(publicId);
              if (result.result !== "ok") {
                return next(
                  new ApiError(
                    `Failed to delete image from Cloudinary: ${JSON.stringify(
                      result
                    )}`,
                    500
                  )
                );
              }
            } catch (error) {
              return next(
                new ApiError(
                  `Error deleting image from Cloudinary: ${error.message}`,
                  500
                )
              );
            }
          }
        })
      );
    }

    if (req.files.imageCover && req.files.imageCover[0].buffer) {
      const imageCoverFileName = `${modelName}-${uuidv4()}-${Date.now()}-cover.png`;
      const publicIdCover = imageCoverFileName.split(".")[0];

      try {
        const processedImageCoverBuffer = await sharp(
          req.files.imageCover[0].buffer
        )
          .toFormat("png")
          .png({ quality: 95 })
          .toBuffer();

        const cloudinaryResponseCover = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              public_id: publicIdCover,
              folder: `Tandn-shop/${folderName}`,
            },
            (error, result) => {
              if (error) {
                reject(new Error("Error uploading imageCover to Cloudinary"));
              } else {
                resolve(result);
              }
            }
          );
          stream.end(processedImageCoverBuffer);
        });

        document.imageCover = cloudinaryResponseCover.secure_url;
      } catch (error) {
        return next(
          new ApiError("Error processing or uploading imageCover", 500)
        );
      }
    }

    if (req.files.images) {
      document.images = [];

      await Promise.all(
        req.files.images.map(async (img, index) => {
          if (img.buffer) {
            const imageName = `${modelName}-${uuidv4()}-${Date.now()}-${
              index + 1
            }.png`;
            const publicIdImage = imageName.split(".")[0];

            try {
              const processedImageBuffer = await sharp(img.buffer)
                .toFormat("png")
                .png({ quality: 95 })
                .toBuffer();

              const cloudinaryResponseImage = await new Promise(
                (resolve, reject) => {
                  const stream = cloudinary.uploader.upload_stream(
                    {
                      public_id: publicIdImage,
                      folder: `Tandn-shop/${folderName}`,
                    },
                    (error, result) => {
                      if (error) {
                        reject(
                          new Error(
                            `Error uploading image ${index + 1} to Cloudinary`
                          )
                        );
                      } else {
                        resolve(result);
                      }
                    }
                  );
                  stream.end(processedImageBuffer);
                }
              );

              document.images.push(cloudinaryResponseImage.secure_url);
            } catch (error) {
              return next(
                new ApiError(
                  `Error processing or uploading image ${index + 1}`,
                  500
                )
              );
            }
          }
        })
      );
    }

    await document.save();

    next();
  });
