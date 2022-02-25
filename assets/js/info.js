/* INFO */
class Info {
    constructor() {
        
    }
    
    addInfoFromData(_data, _levels) {
        _data.forEach((element, index) => {          
          // create mission-container element
          let missionContainerElement = document.createElement("div");
          missionContainerElement.classList.add("mission-container");
          missionContainerElement.setAttribute('data-mission', Object.keys(_levels)[index]);
          document.querySelector("#info").appendChild(missionContainerElement);

          // add mission level groups containers
          let name = Object.keys(_levels)[index];
          let levelMax = _levels[name].length - 1;

          for (let i=1; i<=levelMax; i++) {
            let missionLevelGroupElement = document.createElement("div");
            missionLevelGroupElement.classList.add("mission-level-group");
            missionLevelGroupElement.classList.add("level-" + (i));
            
            missionContainerElement.appendChild(missionLevelGroupElement);

            // add mission info elements based on their level
            let currentLevelInfo = _levels[name][i];
            
            currentLevelInfo.forEach((info, order) => {
              
              let missionInfoElement = this.createInfoMarkup(info, element[info], order == 0 ? true : false);
              
              missionLevelGroupElement.appendChild(missionInfoElement);
            });
          }          
        });
    }
    
    createInfoMarkup(_info, _data, isLink = false) {
        // Element
        let missionInfoElement = document.createElement("div");
        missionInfoElement.classList.add("mission-info");

        // Title
        let missionInfoTitleElement = document.createElement("h3");
        missionInfoTitleElement.classList.add("mission-info-title");
        missionInfoTitleElement.innerHTML = _info.replaceAll("_",  " ").toUpperCase();
        missionInfoElement.appendChild(missionInfoTitleElement);

        // Data
        let missionInfoDataElement;
        if (isLink) {
          missionInfoDataElement = document.createElement("a");
          missionInfoDataElement.href = "#";

          missionInfoDataElement.setAttribute('data-mission', _data);
          
          missionInfoDataElement.addEventListener("click", this.onMissionSelected.bind(this));
        } else {
          missionInfoDataElement = document.createElement("p");
        }
        missionInfoDataElement.classList.add("mission-info-data");
        missionInfoDataElement.classList.add("mission-" + _info);
        missionInfoDataElement.innerHTML = _data;
        missionInfoElement.appendChild(missionInfoDataElement);
      
        return missionInfoElement;
    }

    showLevelInfo(level, mission = "") {
      if (mission != "") {
        let missionContainerElements = document.getElementsByClassName("mission-container");
        
        for (let element of missionContainerElements) {
          if (element.getAttribute("data-mission") == mission) {
            let levelElement = element.getElementsByClassName("level-" + level)[0];
            levelElement.style.display = "block";
          }
        }
      } else {
        let missionInfoElements = document.getElementsByClassName("mission-level-group");

        for (let element of missionInfoElements) {
          if (element.classList.contains("level-" + level)) {
            element.style.display = "block";
          }
        }  
      }
    }


    onMissionSelected(event) {
      let mission = event.target.getAttribute("data-mission");
      
      let customEvent = new CustomEvent('mission-selected', {'detail': mission});
      document.dispatchEvent(customEvent);
    }
}

export default Info;