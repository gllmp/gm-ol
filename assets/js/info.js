/* INFO */
class Info {
    constructor() {
        
    }
    
    addInfoFromData(_data, _levels) {
        _data.forEach((element, index) => {          
          // create mission-container element
          let missionContainerElement = document.createElement("div");
          missionContainerElement.classList.add("mission-container");
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
            
            currentLevelInfo.forEach(info => {
              let missionInfoElement = this.createInfoMarkup(info, element[info]);

              missionLevelGroupElement.appendChild(missionInfoElement);
            });
          }          
        });
    }
    
    createInfoMarkup(info, data, isLink = false) {
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
}

export default Info;