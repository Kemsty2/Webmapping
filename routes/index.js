const express = require('express');
const rp = require('request-promise');
const multer = require('multer');
const fs = require('fs');
let router, storage, upload;
router = express.Router();
storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "routes/shapefile");
  },
  filename: function (req, file, cb) {
    if (file.hasOwnProperty("originalname")) cb(null, file.originalname);
  }
});
upload = multer({
  storage: storage
});


/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    const options = {
      uri: 'http://localhost:8080/geoserver/rest/workspaces/Cameroun/layers',
      auth: {
        user: 'admin',
        pass: 'geoserver'
      },
      json: true
    }
    const layerGroup = await rp(options);
    res.render('index', {
      title: 'Projet Webmapping',
      layerGroup: layerGroup
    });
  } catch (error) {
    console.error(error);
  }
});

router.post('/addlayer', upload.single('shapefile'), async (req, res) => {
  try {    
    const file = req.file;        
    const raw = __dirname + "\\shapefile\\" + file.filename;
    console.log(raw);    
    const options = {
      uri: 'http://localhost:8080/geoserver/rest/workspaces/Cameroun/datastores/cameroun_GisData/external.shp',
      method: 'PUT',
      auth: {
        user: 'admin',
        pass: 'geoserver'
      },
      headers: {
        'content-type': 'text/plain'
      },
      body: "file:///" + raw
    }    
    rp(options).then(data => {
      console.log("Shapefile Uploaded");
    }).catch(err => {
      console.log("Error While Uploading");
    }).finally(() => {
      fs.unlink(file.path, err => {
        if(err){
          console.error(err);
        }
        console.log("file deleted");
      });
    });    
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
});

module.exports = router;