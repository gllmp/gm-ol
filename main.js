import 'ol/ol.css';
import './assets/css/style.css';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import {toLonLat} from 'ol/proj';
import {toStringHDMS} from 'ol/coordinate';

/* DATA */

/* set up XMLHttpRequest */
let url = "./assets/data/Attributs_Visuel_Web.xlsx";
let oReq = new XMLHttpRequest();

let data = [];

// oReq.onreadystatechange = function(){
//     if(oReq.status == 200 && oReq.readyState == 4){
//         url = oReq.responseText;
//     }
// };

oReq.open("GET", url, true);
oReq.responseType = "arraybuffer";

oReq.onload = function(e) {
    let arraybuffer = oReq.response;

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
    console.log("DATA:", sheetData);

    data = getDataFromSheet(sheetData);
    console.log(data)

    //let keys = Object.keys(sheetData[0]);
    
    // console.log("CRUISE NAME:", sheetData[0].cruise_name.split(","));
    // console.log("VESSEL:", sheetData[0].vessel.split(","));
    // console.log("CO-CHIEFS:", sheetData[0].co_chiefs.split(","));
    // console.log("DATES:", sheetData[0].dates.split(","));
    // console.log("GEOGRAPHIC AREA 1:", sheetData[0].geographic_area_1.split(","));
    // console.log("GEOGRAPHIC AREA 1:", sheetData[0].geographic_area_2.split(","));
    // console.log("MAIN OBJECTIVES:", sheetData[0].main_objectives.split(","));
    // console.log("TOOL 1:", sheetData[0].tool_1.split(","));
    // console.log("TOOL 2:", sheetData[0].tool_2.split(","));
    // console.log("TOOL 3:", sheetData[0].tool_3.split(","));
}

oReq.send();

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

/**
 * Elements that make up the popup.
 */
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

/**
 * Create an overlay to anchor the popup to the map.
 */
const overlay = new Overlay({
  element: container,
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
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

const key = 'inKLFdB7xglu2Az8uVYx';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

/**
 * Create the map.
 */
const map = new Map({
  layers: [
    new TileLayer({
      source: new XYZ({
        attributions: attributions,
        url: 'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=' + key,
        tileSize: 512,
      }),
    }),
  ],
  overlays: [overlay],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

/**
 * Add a click handler to the map to render the popup.
 */
map.on('singleclick', function (evt) {
  const coordinate = evt.coordinate;
  const hdms = toStringHDMS(toLonLat(coordinate));

  content.innerHTML = '<p>You clicked here:</p><code>' + hdms + '</code>';
  overlay.setPosition(coordinate);
});