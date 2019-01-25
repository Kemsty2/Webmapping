const express = require("express");
const rp = require("request-promise");
const multer = require("multer");
const fs = require("fs");
const request = require("request");
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
router.get("/", async function (req, res, next) {
  try {
    const base =
      "http://localhost:8080/geoserver/rest/workspaces/Cameroun/datastores/cameroun_GisData/featuretypes/";
    const options = {
      uri: "http://localhost:8080/geoserver/rest/workspaces/Cameroun/layers",
      auth: {
        user: "admin",
        pass: "geoserver"
      },
      json: true
    };
    let layerGroup = await rp(options);
    if (layersGroup.layers.hasOwnProperty("layer")) {
      layerGroup = await Promise.all(
        layerGroup.layers.layer.map(async layer => {
          const options1 = {
            uri: base + layer.name,
            auth: {
              user: "admin",
              pass: "geoserver"
            },
            json: true
          };
          const attributesBase = await rp(options1);
          if (attributesBase.featureType.srs !== "EPSG:4326") {
            /* featureType = Object.assign({}, featureType, {
              srs: "ESPG:4326"
            }); */
            console.log(attributesBase.featureType.srs);
            attributesBase.featureType.srs = "EPSG:4326";
            console.log(attributesBase.featureType.srs);
            console.log(JSON.stringify(attributesBase));
            const options2 = {
              uri: base + layer.name,
              auth: {
                user: "admin",
                pass: "geoserver"
              },
              method: 'PUT',
              headers: {
                "Content-type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify({ ...attributesBase
              })
            }

            rp(options2).then(() => {
              console.log("Srs Changed to 4326");
            }).catch(err => {
              console.error("error");
            });
          };
          let attributes = attributesBase.featureType.attributes.attribute;
          attributes = attributes.map(attribute => {
            return attribute.name;
          });
          return {
            ...layer,
            attributes: [...attributes]
          };
        })
      );
      //res.json(layerGroup);
      res.render("index", {
        title: "Projet Webmapping",
        layerGroup: layerGroup
      });
    }else{
      //res.json(layerGroup);
    res.render("index", {
      title: "Projet Webmapping",
      layerGroup: []
    });
    }
  } catch (error) {
    console.error(error);
    res.render("index", {
      title: "Projet Webmapping",
      layerGroup: []
    });
  }
});

router.post("/addlayer", upload.single("shapefile"), async (req, res) => {
  try {
    const file = req.file;
    //const raw = __dirname + "\\shapefile\\" + file.filename;
    if (file) {
      const path = file.path;
      const options = {
        uri: "http://localhost:8080/geoserver/rest/workspaces/Cameroun/datastores/cameroun_GisData/file.shp",
        method: "PUT",
        auth: {
          user: "admin",
          pass: "geoserver"
        },
        headers: {
          "content-type": "application/zip"
        }
        /* body: "file:///" + raw */
        /* body: fs.createReadStream(path) */
      };
      fs.createReadStream(path).pipe(
        request.put(options).on("end", done => {
          fs.unlink(file.path, err => {
            if (err) {
              console.error(err);
            }
            console.log("file deleted");
          });
        })
      );
      /* rp(options).then(data => {
        console.log("Shapefile Uploaded");
      }).catch(err => {
        console.log("Error While Uploading");
      }).finally(() => {
        fs.unlink(file.path, err => {
          if (err) {
            console.error(err);
          }
          console.log("file deleted");
        });
      }); */
      res.redirect("/");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

module.exports = router;