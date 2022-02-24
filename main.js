import Data from './assets/js/data';
import Info from './assets/js/info';
import Map from './assets/js/map';

/* INFO */
let info = new Info();

/* MAP */
let map = new Map();

/* DATA */
let dataClass = new Data();

let data = [];
let levels = [];

let url = "./assets/data/Attributs_Visuel_Web.xlsx";

dataClass.ajaxRequest(url)
  .then(function(result) {
    /* convert data to binary string */
    let binaryString = dataClass.toBinaryString(result);

    /* Call XLSX */
    let workbook = XLSX.read(binaryString, {
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
    console.log("SHEET DATA:", sheetData);

    data = dataClass.getDataFromSheet(sheetData);
    console.log("DATA: ", data);

    levels = dataClass.parseDataByLevels(sheetData);
    console.log("LEVELS: ", levels);

    return data;
  })
  .then(function(result) {
    info.addInfoFromData(result, levels);

    return result;
  })
  .then(function(result) {
    map.addPointsFromData(result);
  })
  .catch(function() {
    // An error occurred
  });