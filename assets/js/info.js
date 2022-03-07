/* INFO */
class Info {
    constructor() {
        
    }
    
    async addInfoFromData(_data, _levels) {
      _data.forEach((element, index) => {             
        // Create mission-container element
        let missionContainerElement = document.createElement("div");
        missionContainerElement.classList.add("mission-container");
        missionContainerElement.setAttribute('data-mission', Object.keys(_levels)[index]);
        document.querySelector("#info").appendChild(missionContainerElement);

        // Add mission level groups containers
        let name = Object.keys(_levels)[index];
        let levelMax = _levels[name].length - 1;

        for (let i=1; i<=levelMax; i++) {
          let missionLevelGroupElement = document.createElement("div");
          missionLevelGroupElement.classList.add("mission-level-group");
          missionLevelGroupElement.classList.add("level-" + (i));
          
          missionContainerElement.appendChild(missionLevelGroupElement);

          // Add mission info elements based on their level
          let currentLevelInfo = _levels[name][i];
          
          currentLevelInfo.forEach((info, order) => {
            let isLink = (order == 0 && i == 1) || info.includes("tool") ? true : false;
            let isMission = (order == 0 && i == 1) ? true : false;

            let missionInfoElement = this.createInfoMarkup(info, element[info], isLink, isMission);

            missionLevelGroupElement.appendChild(missionInfoElement);
          });
        }
      });
    }
    
    createInfoMarkup(_info, _data, isLink = false, isMission = false) {
      let missionInfoElement;

      let dataContent = _data;

      if (isLink) {
        missionInfoElement = document.createElement("a");
        missionInfoElement.href = "#";

        if (dataContent[0] == " ") dataContent = dataContent.substring(1);

        missionInfoElement.setAttribute('data-mission', dataContent);
        
        missionInfoElement.classList.add('mission-info-link');

        if (isMission) {
          missionInfoElement.addEventListener("click", this.onMissionSelected.bind(this));
        } else {

        }

      } else {
        missionInfoElement = document.createElement("div");
      }

      missionInfoElement.classList.add("mission-info");
      
      // Title
      let missionInfoTitleElement = document.createElement("h3");
      missionInfoTitleElement.classList.add("mission-info-title");
      missionInfoTitleElement.innerHTML = _info.replaceAll("_",  " ").toUpperCase();
      
      missionInfoElement.appendChild(missionInfoTitleElement);

      // Data
      let missionInfoDataElement = document.createElement("p");

      missionInfoDataElement.classList.add("mission-info-data");
      missionInfoDataElement.classList.add("mission-" + _info);
      
      missionInfoDataElement.innerHTML = dataContent;
      
      missionInfoElement.appendChild(missionInfoDataElement);
      
      return missionInfoElement;
    }

    showLevelInfo(level, mission = "") {
      // if mission name is specified
      if (mission != "") {
        // Remove leading space
        if (mission[0] == " ") mission = mission.substring(1);

        let missionContainerElements = document.getElementsByClassName("mission-container");
        
        for (let element of missionContainerElements) {
          // Show selected mission infos
          if (element.getAttribute("data-mission") == mission) {
            element.classList.remove("hidden");

            element.classList.add("selected");

            let levelElement = element.getElementsByClassName("level-" + level)[0];
            levelElement.style.display = "block";
          } else {
            // Hide all others missions infos
            element.classList.add("hidden");
          }
        }
      } else {
        // If level only is specified
        let missionInfoElements = document.getElementsByClassName("mission-level-group");

        for (let element of missionInfoElements) {
          // Show selected level infos
          if (element.classList.contains("level-" + level)) {
            element.style.display = "block";
          }
        }
      }
    }

    resetLevelInfo(level = 1) {
      // Reset info panel
      if (level == 1) {
        let missionContainerElements = document.getElementsByClassName("mission-container");

        for (let element of missionContainerElements) {
          // Hide selected mission sublevel infos
          if (element.classList.contains("selected")) {
            element.classList.remove("selected");

            let missionInfoElements = element.getElementsByClassName("mission-level-group");
            for (let i = 1; i<missionInfoElements.length; i++) {
              missionInfoElements[i].style.display = "none";
            }
          }

          // Show all mission infos
          element.classList.remove("hidden");
        }     
      }
    }

    onMissionSelected(event) {
      let mission;
      let target;

      // Check for clicked element
      if (!event.target.classList.contains("mission-info-link")) {
        target = event.target.parentElement;
        mission = target.getAttribute("data-mission");
      } else {
        mission = event.target.getAttribute("data-mission");
      }

      // Remove leading space if not done yet
      //mission = mission.split(" ")[1];
      if (mission[0] == " ") mission = mission.substring(1);

      let customEvent = new CustomEvent('mission-selected', {'detail': {mission}});

      document.dispatchEvent(customEvent);
    }
  }


export default Info;