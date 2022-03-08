import Data from './assets/js/data';
import Info from './assets/js/info';
import Map from './assets/js/map';

/* INFO */
let info = new Info();

let backButtonElement = document.getElementById("back-button");

/* MAP */
let map;

/* DATA */
let dataClass = new Data();

let data = [];
let levels = [];

let currentLevel = 1;
let currentMission = "";
let currentTool = "";

//let url = "./assets/data/Attributs_Visuel_Web.xlsx";
//let url = "https://docs.google.com/spreadsheets/d/1lXGYPIITZfSEzN4XdRXRreDcHx5vRik8/export?gid=243091869&format=xlsx"

dataClass.getUrl()
  .then(function(json) {
    dataClass.ajaxRequest(json.url)
    .then(function(result) {
      /* convert data to binary string */
      let binaryString = dataClass.toBinaryString(result);

      /* Call XLSX */
      let workbook = XLSX.read(binaryString, {
          type: "binary"
      });
      
      //console.log("workbook:", workbook);

      /* DO SOMETHING WITH workbook HERE */
      let sheet_name = workbook.SheetNames[0];
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
      // Info
      info.addInfoFromData(result, levels);
      
      info.showLevelInfo(1);

      return result;
    })
    .then(function(result) {
      // Map
      map = new Map(result);

      map.addPointsFromData(result);
    })
    .then(function(result) {

      // Update map size after info panel resize
      let infoPanelElement = document.getElementById("info");
      
      let resizeObserver = new ResizeObserver(() => {
        map.map.updateSize();
      });

      resizeObserver.observe(infoPanelElement);

      // On mission selected
      const missionSelectedEvent = new CustomEvent('mission-selected');

      document.addEventListener("mission-selected", onMissionSelected);
      document.addEventListener("tool-selected", onToolSelected);

      function onMissionSelected(event) {
        // Set level
        currentLevel = 2;

        // Show new level infos
        currentMission = event.detail.mission;

        info.showLevelInfo(currentLevel, currentMission);

        // Select feature on map
        map.selectFeature(currentMission);

        // Back button
        backButtonElement.disabled = false;
      }

      function onToolSelected(event) {
        currentTool = event.detail.tool;

        let toolTitle = Object.keys(currentTool)[0];
        let toolContent = Object.values(currentTool)[0];
        if (toolContent[0] == " ") toolContent = toolContent.substring(1);

        // Select tool in info panel
        map.selectToolInfoPanel(toolContent);

        // Show infos in popup
        let feature = map.getFeature(toolTitle);

        map.showPopupInfo(feature);
      }

      // Back button clicked
      backButtonElement.addEventListener("click", onBackButtonClicked);

      function onBackButtonClicked(event) {
        // Set level
        if (currentLevel > 1) currentLevel--;

        // Show level info
        info.resetLevelInfo(currentLevel);

        // Deselect tool
        map.deselectToolInfoPanel();

        // Reset map view
        map.resetMapView(currentLevel, currentMission);

        // Back button
        if (currentLevel == 1) {
          backButtonElement.disabled = true;

          currentMission = "";
          currentTool = "";
        } 
      }
    })
    .catch(function(error) {
      // An error occurred
      console.log("ERROR: ", error);
    });
  })
  .catch(function(error) {
    // An error occurred
    console.log("ERROR: ", error);
  });

