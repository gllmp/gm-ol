/* INFO */
class Info {
    constructor() {
        
    }
    
    addInfoFromData(_data) {
        _data.forEach(element => {
          let missionContainerElement = document.createElement("div");
          missionContainerElement.classList.add("mission-container");
          document.querySelector("#info").appendChild(missionContainerElement);
        
          let cruiseNameElement = this.createInfoMarkup("cruise_name", element.cruise_name, true);
          missionContainerElement.appendChild(cruiseNameElement);
      
          let vesselElement = this.createInfoMarkup("vessel", element.vessel);
          missionContainerElement.appendChild(vesselElement);
      
          let coChiefsElement = this.createInfoMarkup("co_chiefs", element.co_chiefs);
          missionContainerElement.appendChild(coChiefsElement);
      
          let datesElement = this.createInfoMarkup("dates", element.dates);
          missionContainerElement.appendChild(datesElement);
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