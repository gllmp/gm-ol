import 'ol/ol.css';
import './assets/css/style.css';
import * as ol from 'ol';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import Point from 'ol/geom/Point';
import TileJSON from 'ol/source/TileJSON';
import {Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import {Icon, Style} from 'ol/style';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import {toLonLat, fromLonLat} from 'ol/proj';
import {toStringHDMS} from 'ol/coordinate';

/* DATA */
let data = [];

/* set up XMLHttpRequest */
function ajaxRequest(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      resolve(this.response);
    };
    xhr.onerror = reject;
    xhr.open('GET', url);
    xhr.responseType = "arraybuffer";
  
    xhr.send();
  });
}

let url = "./assets/data/Attributs_Visuel_Web.xlsx";

ajaxRequest(url)
  .then(function(result) {
    let arraybuffer = result;

    /* convert data to binary string */
    let bufferData = new Uint8Array(arraybuffer);
    let arr = new Array();
    for (let i = 0; i != bufferData.length; ++i) arr[i] = String.fromCharCode(bufferData[i]);
    let bstr = arr.join("");

    /* Call XLSX */
    let workbook = XLSX.read(bstr, {
        type: "binary"
    });
    
    //console.log("workbook:", workbook);

    /* DO SOMETHING WITH workbook HERE */
    let sheet_name = workbook.SheetNames[1];
    /* Get worksheet */
    let worksheet = workbook.Sheets[sheet_name];
    //console.log("worksheet:", worksheet);

    let sheetData = XLSX.utils.sheet_to_json(worksheet, {
        raw: true
    });
    //console.log("SHEET DATA:", sheetData);

    data = getDataFromSheet(sheetData);
    console.log("DATA: ", data);

    return data;
  })
  .then(function(result) {
    addInfoFromData(result);

    return result;
  })
  .then(function(result) {
    addPointsFromData(result);
  })
  .catch(function() {
    // An error occurred
  });

function getDataFromSheet(sheetData) {
  let processedData = [];

  sheetData.forEach(element => {
    let obj = {};

    let name = element.cruise_name.split(", ")[1];

    if ((name != "") && (name != "test") && (name != "NoData")) {
      const keys = Object.keys(element);
      const vals = Object.keys(element).map(key => element[key]);
      
      for (let i=0; i<keys.length; i++) {
        let val = vals[i].split(", ")[1];

        if ((val != "") && (val != "test") && (val != "NoData")) {
          let tempKeyVal = {};
          tempKeyVal[keys[i]] = val;

          Object.assign(obj, tempKeyVal);
        }  
      }

      processedData.push(obj);
    }
  });

  return processedData;
}


/* INFO */
function addInfoFromData(_data) {
  _data.forEach(element => {
    let missionContainerElement = document.createElement("div");
    missionContainerElement.classList.add("mission-container");
    document.querySelector("#info").appendChild(missionContainerElement);
  
    let cruiseNameElement = createInfoMarkup("cruise_name", element.cruise_name, true);
    missionContainerElement.appendChild(cruiseNameElement);

    let vesselElement = createInfoMarkup("vessel", element.vessel);
    missionContainerElement.appendChild(vesselElement);

    let coChiefsElement = createInfoMarkup("co_chiefs", element.co_chiefs);
    missionContainerElement.appendChild(coChiefsElement);

    let datesElement = createInfoMarkup("dates", element.dates);
    missionContainerElement.appendChild(datesElement);
  });
}

function createInfoMarkup(info, data, isLink = false) {
  let missionInfoElement = document.createElement("div");
  missionInfoElement.classList.add("mission-info");

  let missionInfoTitleElement = document.createElement("h3");
  missionInfoTitleElement.classList.add("mission-info-title");
  missionInfoTitleElement.innerHTML = info;
  missionInfoElement.appendChild(missionInfoTitleElement);

  let missionInfoDataElement;
  if (isLink) {
    missionInfoDataElement = document.createElement("a");
    missionInfoDataElement.href = "#";
  } else {
    missionInfoDataElement = document.createElement("p");
  }
  missionInfoDataElement.classList.add("mission-info-data");
  missionInfoDataElement.classList.add("mission-" + info);
  missionInfoDataElement.innerHTML = data;
  missionInfoElement.appendChild(missionInfoDataElement);

  return missionInfoElement;
}

/* MAP */

/* Icon */

const iconFeature = new Feature({
  geometry: new Point([-3.7, 36.0]),
  //geometry: new Point(fromLonLat([-3.7, 36.0])),
  name: 'Null Island',
  population: 4000,
  rainfall: 500,
});


const iconStyle = new Style({
  image: new Icon({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: './assets/img/icon.png',
  }),
});

iconFeature.setStyle(iconStyle);

const vectorSource = new VectorSource({
  features: [iconFeature],
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});

/**
 * Elements that make up the popup.
 */
const popUpContainer = document.getElementById('popup');
const popUpContent = document.getElementById('popup-content');
const popUpCloser = document.getElementById('popup-closer');

/**
 * Create an overlay to anchor the popup to the map.
 */
const overlay = new Overlay({
  element: popUpContainer,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
 popUpCloser.onclick = function () {
  overlay.setPosition(undefined);
  popUpCloser.blur();
  return false;
};

const key = 'inKLFdB7xglu2Az8uVYx';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

/**
 * Create the map.
 */
 const rasterLayer = new TileLayer({
  source: new TileJSON({
    url: 'https://a.tiles.mapbox.com/v3/aj.1x1-degrees.json?secure=1',
    crossOrigin: '',
  }),
});

const mapTiler = new TileLayer({
  source: new XYZ({
    attributions: attributions,
    url: 'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=' + key,
    tileSize: 512,
  }),
});

// Spherical Mercator: EPSG:3857
// Lon/Lat coordinates: EPSG:4326
const view = new View({
  center: [0, 0],
  zoom: 2,
  projection: "EPSG:4326"
})

const map = new Map({
  layers: [mapTiler, vectorLayer],
  overlays: [overlay],
  target: 'map',
  view: view
});

console.log("MAP: ", map);

/**
 * Add a click handler to the map to render the popup.
 */
map.on('singleclick', function (evt) {
  const coordinate = evt.coordinate;
  const hdms = toStringHDMS(toLonLat(coordinate));

  popUpContent.innerHTML = '<p>You clicked here:</p><code>' + hdms + '</code>';
  overlay.setPosition(coordinate);
});


// add marker on click
// map.on('singleclick', function (evt) {
//   const coordinate = evt.coordinate;
//   //console.log(coordinate);
//   //console.log(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'));
//   addMarker(coordinate);
// });

function addMarker(coordinates) {
  let marker = new ol.Feature(new Point(coordinates));
  marker.setStyle(iconStyle);
  vectorSource.addFeature(marker);
}

// Add mission points on map

function addPointsFromData(_data) {
  _data.forEach(element => {
    let coords = [];
    let coordsStr = element.geographic_area_1;
    
    if ((coordsStr != "") && (coordsStr != "test") && (coordsStr != "NoData") && (coordsStr != "No Data")) {
      let lon = parseFloat(coordsStr.split("Longitude ").pop().split("_")[0]);
      let lat = parseFloat(coordsStr.split("Latitude ").pop());

      coords.push(lon, lat);

      addMarker(coords);
    }

  });
}