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

module.exports = router;
