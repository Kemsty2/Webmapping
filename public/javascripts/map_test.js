/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(function () {
  const format = "image/png";
  const excludeAttribute = ["gid", "osm_id", "osm_way_id", "ref_COG", "the_geom", "fid"];
  const operateurs = ["=", "<>", ">", ">=", "<", "<=", "LIKE", "IN"];
  const layersGroup = obj;
  const cqlAttribut = $("#cqlAttribut");
  const cqlOperateur = $("#cqlOperateur");
  let uniqueAttributes = [];

  let layers;
  layers = layersGroup.map(layer => {

    //Constrution de l'ensemble des valeurs attributaires unique
    layer.attributes.map(attribute => {
      if (uniqueAttributes.indexOf(attribute) === -1 && excludeAttribute.indexOf(attribute) === -1) {
        uniqueAttributes.push(attribute);
      }
    });
    const layerTile = new ol.layer.Tile({
      name: layer.name,
      source: new ol.source.TileWMS({
        ratio: 1,
        url: "http://localhost:8080/geoserver/Cameroun/wms",
        params: {
          FORMAT: format,
          VERSION: "1.1.1",
          TILED: true,
          LAYERS: layer.name,
          exceptions: "application/vnd.ogc.se_inimage",
          tilesOrigin: 8.38221740722656 + "," + 1.65466582775116
        },
        serverType: "geoserver"
      }),
      attributes: [...layer.attributes]
    });
    return layerTile;
  });

  //Ajout dans le select
  uniqueAttributes.map(attribute => {
    const options = `<option value="${attribute}">${attribute}</option>`;
    cqlAttribut.append(options);
  });

  operateurs.map(operateur => {
    const options = `<option value="${operateur}">${operateur}</option>`;
    cqlOperateur.append(options);
  });

  const layerGroup = new ol.layer.Group({
    layers: layers,
    name: "Cameroun"
  });

  var projection = new ol.proj.Projection({
    code: 'EPSG:4326',
    units: 'degrees',
    axisOrientation: 'neu',
    global: false
  });

  const map = new ol.Map({
    target: "vmap-world1",
    layers: [layerGroup],
    view: new ol.View({
      //projection: projection,
      center: ol.proj.fromLonLat([12.41, 7.8]),
      zoom: 6.4
    }),
    controls: ol.control.defaults().extend([
      //new ol.control.Attribution(),
      new ol.control.ScaleLine({
        units: "degrees",
        minwidth: 100
      }),
      new ol.control.MousePosition({
        coordinateFormat: function (coordinates) {
          const coord_x = coordinates[0].toFixed(3);
          const coord_y = coordinates[1].toFixed(3);
          return coord_x + ", " + coord_y;
        },
        target: "coordinates"
      }),
      new ol.control.ZoomSlider(),
      new ol.control.OverviewMap({
        collapsible: false
      }),
      new ol.control.FullScreen()
    ]),
    interactions: ol.interaction
      .defaults({
        shiftDragZoom: true
      })
      .extend([
        new ol.interaction.Select({
          layers: [layerGroup]
        }),
        new ol.interaction.DragRotateAndZoom()
      ])
  });

  /* map.on("singleclick", function (evt) {
    var view = map.getView();
    var viewResolution = view.getResolution();

    layers.map(layer => {
      var url = layer
        .getSource()
        .getGetFeatureInfoUrl(
          evt.coordinate,
          viewResolution,
          view.getProjection(), {
            INFO_FORMAT: "application/json",
            FEATURE_COUNT: 50
          }
        );
      if (url) {
        $.ajax({
          url: url,
          type: "GET",          
          dataType: "json",
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          success: function (response) {
            var resp = JSON.parse(response)
            console.log(resp);
          },
          error: function (xhr, status) {
            alert("error");
          }
        });
      }
    });
  }); */

  const layerList = $("#layerList");
  map.getLayers().forEach(layer => {
    layer.getLayers().forEach((sublayer, j) => {
      const layerId = "layer" + j;
      const content = `<li class="list-group-item no-padding-l-r">
      <div class="checkbox checkbox-square checkbox-primary checkbox-lg">
        <input id="${layerId}" type="checkbox" checked=${sublayer.getVisible()}>
        <label for="${layerId}" style="font-size: medium">${sublayer.get(
        "name"
      )}</label>
      </div>
    </li>`;
      layerList.prepend(content);
      bindInputs(layerId, sublayer);
    });
  });

  $("#filter").on('click', (evt) => {
    updateFilter();
  });

  $("#reset").on('click', (evt) => {
    resetFilter();
  });

  function updateFilter(type) {
    var filterParams = {
      'CQL_FILTER': null,
    };
    if (type === "reset") {
      map.getLayers().forEach(function (lyr) {
        lyr.getLayers().forEach(subLyr => {
          subLyr.getSource().updateParams(filterParams);
          subLyr.getSource().refresh()
        });
      });
    } else {
      const attribut = $("#cqlAttribut").children("option:selected").val();
      const operateur = $("#cqlOperateur").children("option:selected").val();
      const valeur = $("#cqlValue").val();
      var filter = attribut + ' ' + operateur + ' ' + valeur;
      if ((filter.replace(/^\s\s*/, '').replace(/\s\s*$/, '') != "") || attribut.length !== 0 || operateur.length !== 0) {
        filterParams["CQL_FILTER"] = filter;
      }
      map.getLayers().forEach(function (lyr) {
        lyr.getLayers().forEach(subLyr => {
          const attributes = subLyr.get("attributes");
          if (attributes.indexOf(attribut) !== -1) {
            subLyr.getSource().updateParams(filterParams);
            subLyr.getSource().refresh();
          }
        })
      });
    }
  }

  function resetFilter() {
    $("#cqlAttribut").prop("selectedIndex", 0);
    $("#cqlOperateur").prop("selectedIndex", 0);
    $("#cqlValue").val("");
    updateFilter("reset");
  }

  function bindInputs(layerid, layer) {
    var visibilityInput = $("#" + layerid);
    visibilityInput.on("change", function () {
      layer.setVisible(this.checked);
    });
    visibilityInput.prop("checked", layer.getVisible());
  }
});