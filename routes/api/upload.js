const express = require('express');
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: './public/uploads/' });

//  @route      Upload api/upload
//  @desc       upload a file
//  @access     public
router.post('/images', upload.single('avatar'), (req, res) => {
  console.log('###', req);
  const files = req.files;
  // console.log(files);

  res.send('okay');
});

//  AWS
aws.config.update({
  region: 'us-east-2',
  accessKeyId: 'AKIAJ2B3DVRUUFUI4MCQ',
  secretAccessKey: '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',
});
const S3_BUCKET = 'charles-cho-dev';

// default options

//  @route      Upload api/upload
//  @desc       upload a file
//  @access     public

router.post('/', async (req, res) => {
  if (!req.files) {
    return res.status(500).send({ msg: 'file is not found' });
  }
  const s3 = new aws.S3();
  const file = req.files.file;
  const url = req.body.url;
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: file.name,
    Body: file.data,
    ContentType: file.type,
    ACL: 'public-read',
  };
  s3.upload(s3Params, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
    res.json(data.Location);
  });
});

//  @route      Upload api/upload
//  @desc       upload a file
//  @access     public

router.get('/sign-s3', (req, res) => {
  const s3 = new aws.S3();
  const fileName = req.query.fileName;
  const fileType = req.query.fileType;
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read',
  };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if (err) {
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.us-east-2.amazonaws.com/${fileName}`,
    };
    res.json(returnData);
  });
});

module.exports = router;
