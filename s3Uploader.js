// s3Uploader.js
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("./s3config");
require('dotenv').config();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "private",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const filename = Date.now().toString() + "_" + file.originalname;
      cb(null, filename);
    },
  }),
});

module.exports = upload;
