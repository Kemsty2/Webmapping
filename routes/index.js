const express = require('express');
const rp = require('request-promise');
const multer = require('multer');
let router, storage, upload;
router = express.Router();
storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/images/election");
  },
  filename: function(req, file, cb) {
    if (file.hasOwnProperty("originalname")) cb(null, file.originalname);
  }
});
upload = multer({ storage: storage });


/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const options = {
      uri: 'http://localhost:8080/geoserver/rest/workspaces/Cameroun/layergroups/LayersGroupCmr',
      auth: {
        user: 'admin',
        pass: 'geoserver'
      },
      json: true
    }
    const layerGroup = await rp(options);
    //res.json(layerGroup);
    res.render('index', { title: 'Projet Webmapping', layerGroup: layerGroup });
  } catch (error) {
    console.error(error);
  }
});

router.post('/uploadShapeFile', upload.single('shapeFile'), (req, res) => {
  try {
    
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
