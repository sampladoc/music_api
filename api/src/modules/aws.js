const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const ext = require('file-extension');
const awsConfig = require('../config/config').aws;

const s3 = new aws.S3({
  accessKeyId: awsConfig.accessKey,
  secretAccessKey: awsConfig.secretKey,
});

const storageImage = multerS3({
  s3,
  bucket: awsConfig.bucketImages,
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    cb(null, `${Date.now()}.${ext(file.originalname)}`);
  },
});

const uploaderImage = multer({ storage: storageImage,
  fileFilter: (req, file, cb) => {
    const fileExt = ext(file.originalname);
    if (fileExt === 'jpeg' || fileExt === 'jpg' || fileExt === 'png') {
      cb(null, true);
    } else {
      return cb('Wrong file format. JPEG/JPG and PNG fomats are allowed.');
    }
  },
}).single('data');

const storageMedia = (key) => {
  return multerS3({
    s3,
    bucket: awsConfig.bucketMedia,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, key);
    },
  });
};

const uploaderMedia = (key, res, req, cb) => {
  const uploader = multer({
    storage: storageMedia(key),
    fileFilter: (req, file, cb) => {
      const fileExt = ext(file.originalname);
      if (fileExt === 'mp3') {
        cb(null, true);
      } else {
        return cb('Wrong file format. Only MP3 fomats are allowed.');
      }
    },
  }).single('data');
  uploader(res, req, cb);
}


const signedUrlExpireSeconds = 604800 //Seven Days is the Max

const urlMedia = (key) => {
  return s3.getSignedUrl('getObject', {
      Bucket: awsConfig.bucketMedia,
      Key: key,
      Expires: signedUrlExpireSeconds
  })
}

module.exports = { uploaderMedia, uploaderImage, urlMedia };
