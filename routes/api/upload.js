const express = require('express');
const router = express.Router();

const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);

const multer = require('multer');

const { uploadFile, getFileStream } = require('../../s3');
// MULTER CONFIG
const storage = multer.diskStorage({
  destination: './uploads/images/',
  // filename: (req, file, cb) => {
  //   cb(null, file.fieldname + '-' + Date.now());
  // },
});
// MULTER upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      return cb(new Error('Invalid mime type'));
    }
  },
});

//  @route      api/upload/images/:key
//  @desc       GET image using key
//  @access     public
router.get('/images/:key', (req, res) => {
  console.log(req.params);
  const key = req.params.key;
  const readStream = getFileStream(key);

  readStream.pipe(res);
});

//  @route      Upload api/upload/images
//  @desc       upload a file
//  @access     public
router.post('/images', upload.single('asdf'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(500).send({ msg: 'file is not found' });
  }
  try {
    //TODO:: ADD apply filter

    //TODO:: ADD resize

    const result = await uploadFile(file);
    await unlinkFile(file.path);

    console.log(result);
    res.status(200).send({ imagePath: `/images/${result.Key}` });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server Error');
  }
  // else {
  //
  // }
});

// //  AWS
// aws.config.update({
//   region: 'us-east-2',
//   accessKeyId: 'AKIAJ2B3DVRUUFUI4MCQ',
//   secretAccessKey: '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',
// });
// const S3_BUCKET = 'charles-cho-dev';

// // default options

// router.post('/', async (req, res) => {
//   if (!req.files) {
//     return res.status(500).send({ msg: 'file is not found' });
//   }
//   const s3 = new aws.S3();
//   const file = req.files.file;
//   const url = req.body.url;
//   const s3Params = {
//     Bucket: S3_BUCKET,
//     Key: file.name,
//     Body: file.data,
//     ContentType: file.type,
//     ACL: 'public-read',
//   };
//   s3.upload(s3Params, function (err, data) {
//     if (err) {
//       throw err;
//     }
//     console.log(`File uploaded successfully. ${data.Location}`);
//     res.json(data.Location);
//   });
// });

// //  @route      Upload api/upload
// //  @desc       upload a file
// //  @access     public

// router.get('/sign-s3', (req, res) => {
//   const s3 = new aws.S3();
//   const fileName = req.query.fileName;
//   const fileType = req.query.fileType;
//   const s3Params = {
//     Bucket: S3_BUCKET,
//     Key: fileName,
//     Expires: 60,
//     ContentType: fileType,
//     ACL: 'public-read',
//   };

//   s3.getSignedUrl('putObject', s3Params, (err, data) => {
//     if (err) {
//       console.log(err);
//       return res.end();
//     }
//     const returnData = {
//       signedRequest: data,
//       url: `https://${S3_BUCKET}.s3.us-east-2.amazonaws.com/${fileName}`,
//     };
//     res.json(returnData);
//   });
// });

module.exports = router;
