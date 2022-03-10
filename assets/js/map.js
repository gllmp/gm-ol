/* MAP */
import 'ol/ol.css';
import '../css/style.css';
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
import * as olExtent from 'ol/extent';
import XYZ from 'ol/source/XYZ';
import {toLonLat, fromLonLat} from 'ol/proj';
import {toStringHDMS} from 'ol/coordinate';
import * as Easing from 'ol/easing';

class OpenLayerMap {
    constructor(_data) {
        let _this = this;

        this.data = _data;

        // Icon
        // this.iconFeature = new Feature({
        //     geometry: new Point([-3.7, 36.0]),
        //     //geometry: new Point(fromLonLat([-3.7, 36.0])),
        //     // name: 'Null Island',
        //     // population: 4000,
        //     // rainfall: 500,
        // });
        
        this.iconStyle = new Style({
            image: new Icon({
                anchor: [0.55, 18],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                //src: './assets/img/icon.png',
                //src: './assets/img/circle-icon.png',
                //src: "https://drive.google.com/uc?export=download&id=1QACJLnHjJMCYrnZtRXDu_TKid1tuonzy",
                src: "https://drive.google.com/uc?export=download&id=1Jc8jthWYCkzynAwWvF0CJyN1lKQs8bRB",
            }),
        });
        
        //this.iconFeature.setStyle(this.iconStyle);
        
        this.vectorSource = new VectorSource({
            //features: [iconFeature],
            features: [],
        });
        
        this.vectorLayer = new VectorLayer({
            source: this.vectorSource,
        });
        
        this.features;

        // Elements that make up the popup
        this.popUpContainer = document.getElementById('popup');
        this.popUpContent = document.getElementById('popup-content');
        this.popUpCloser = document.getElementById('popup-closer');
        
        // Create an overlay to anchor the popup to the map
        this.popup = new Overlay({
            element: this.popUpContainer,
            autoPan: {
                animation: {
                    duration: 250,
                },
            },
        });
        
        // add a click handler to hide the popup
        // @return {boolean} Don't follow the href
         this.popUpCloser.onclick = function () {
            _this.popup.setPosition(undefined);
            _this.popUpCloser.blur();

            // Deselect tool on popup close
            _this.deselectToolInfoPanel();

            return false;
        };
        
        const key = 'inKLFdB7xglu2Az8uVYx';
        const attributions =
            '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
            '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
        
        // Create the map
        this.rasterLayer = new TileLayer({
            source: new TileJSON({
            url: 'https://a.tiles.mapbox.com/v3/aj.1x1-degrees.json?secure=1',
            crossOrigin: '',
            }),
        });
        
        this.mapTiler = new TileLayer({
            source: new XYZ({
            attributions: attributions,
            url: 'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=' + key,
            tileSize: 512,
            }),
        });
        
        // Views
        // Spherical Mercator: EPSG:3857
        // Lon/Lat coordinates: EPSG:4326
        this.views = [];
        this.views["HOME"] = new View({
            center: [0, 0],
            zoom: 2,
            //projection: "EPSG:4326"
        });

        this.map = new Map({
            layers: [this.mapTiler, this.vectorLayer],
            overlays: [this.popup],
            target: 'map',
            view: this.views["HOME"]
        });
        
        //console.log("MAP: ", map);
        
        // Add a click handler to the map to render the popup
         
        //  this.map.on('singleclick', function (evt) {
        //     const coordinate = evt.coordinate;
        //     const hdms = toStringHDMS(toLonLat(coordinate));
        
        //     _this.popUpContent.innerHTML = '<p>You clicked here:</p><code>' + hdms + '</code>';
        //     _this.overlay.setPosition(coordinate);
        // });
        
        // Add marker on click
        // this.map.on('singleclick', function (evt) {
        //   const coordinate = evt.coordinate;
        //   //console.log(coordinate);
        //   //console.log(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'));
        //   _this.addMarker(coordinate);
        // });

        // Display popup on click
        this.map.on('click', function (evt) {
            evt.preventDefault();

            const feature = _this.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                return feature;
            });

            if (feature) {
                if (feature.get("type") == "mission") {
                    let mission = feature.get("mission");
      
                    let customEvent = new CustomEvent('mission-selected', {'detail': {mission, feature}});
              
                    document.dispatchEvent(customEvent);
                } else if (feature.get("type") == "tool") {
                    let mission = feature.get("mission");
                    let tool = {};
                    tool[Object.keys(feature.get("tool"))[0]] = Object.values(feature.get("tool"))[0];

                    let customEvent = new CustomEvent('tool-selected', {'detail': {mission, tool}});
              
                    document.dispatchEvent(customEvent);
                }


                // _this.popUpContainer.popover({
                //     placement: 'top',
                //     html: true,
                //     content: feature.get('name'),
                // });
                // _this.popUpContainer.popover('show');
            } else {
                //_this.popUpContainer.popover('dispose');
            }
        });
        
        // Change mouse cursor when over marker
        _this.map.on('pointermove', function (e) {
            const pixel = _this.map.getEventPixel(e.originalEvent);
            const hit = _this.map.hasFeatureAtPixel(pixel);

            let targetElement = document.getElementById(_this.map.getTarget());
            targetElement.style.cursor = hit ? 'pointer' : '';
        });

        // Close the popup when the map is moved
        _this.map.on('movestart', function () {
            //_this.popUpContainer.popover('dispose');
        });
    }

    // Set mission views
    setViews(_data) {
        for (const [index, mission] of _data.entries()) {
            let missionName = this.getMissionName(mission);

            let coordsStr = mission.geographic_area_2;

            if ((coordsStr != "") && (coordsStr != undefined) && (coordsStr != "test") && (coordsStr != " test") && (coordsStr != "NoData") && (coordsStr != "No Data") && (coordsStr != " No Data")) {                    
                let north = parseFloat(coordsStr.split("North ").pop().split("_")[0]);
                let south = parseFloat(coordsStr.split("South ").pop().split("_")[0]);
                let west = parseFloat(coordsStr.split("West ").pop().split("_")[0]);
                let east = parseFloat(coordsStr.split("East ").pop().split("_")[0]);
    
                let newLonLat = fromLonLat([west, north]);
                let west_3857 = newLonLat[0];
                let north_3857 = newLonLat[1];
            
                newLonLat = fromLonLat([east, south]);
                let east_3857 = newLonLat[0];
                let south_3857 = newLonLat[1];
            
                let extent = [west_3857, south_3857, east_3857, north_3857];

                let view = new View({
                    center: [0, 0],
                    zoom: 6,
                    extent: extent,
                });

                this.views[missionName] = view;
            }    
        }
    }

    // Add mission points on map
    async addPointsFromData(_data) {
        for (const [index, element] of _data.entries()) {
            // Mission points
            await this.addMissionMarkers(element);

            // Tool points
            //await this.addToolsMarkers(element);
        }
    }

    addMarker(coordinates, type = "", mission = "", tool = "") {
        let marker = new ol.Feature({
            geometry: new Point(coordinates),
            type: type,
            mission: mission,
            tool: tool,
        });


        marker.setStyle(this.iconStyle);
        
        this.vectorSource.addFeature(marker);
        
        if (type == "tool") {
            let center = this.getFeatureCoordinates(mission);

            marker.getGeometry().translate(center[0], center[1]);
        }
    }

    addMissionMarkers(mission) {
        let _this = this;

        return new Promise(function (resolve, reject) {
            let missionName = _this.getMissionName(mission);

            let coords = [];
            let coordsStr = mission.geographic_area_1;

            if ((coordsStr != "") && (coordsStr != undefined) && (coordsStr != "test") && (coordsStr != " test") && (coordsStr != "NoData") && (coordsStr != "No Data") && (coordsStr != " No Data")) {
                let lon = parseFloat(coordsStr.split("Longitude ").pop().split("_")[0]);
                let lat = parseFloat(coordsStr.split("Latitude ").pop());

                coords.push(lon, lat);

                _this.addMarker(fromLonLat(coords), "mission", missionName);
            }

            resolve();
        });
    }

    addToolsMarkers(mission) {
        let _this = this;

        let tools = this.getTools(mission);

        return new Promise(function (resolve, reject) {
            let missionName = _this.getMissionName(mission);

            let coordsStr = mission.geographic_area_2;

            if ((coordsStr != "") && (coordsStr != undefined) && (coordsStr != "test") && (coordsStr != " test") && (coordsStr != "NoData") && (coordsStr != "No Data") && (coordsStr != " No Data")) {                
                const keys = Object.keys(tools);
                const vals = Object.values(tools);

                let center = toLonLat(_this.getFeatureCoordinates(missionName));
                let steps = keys.length;

                let coords = _this.generateCircularCoordinates(center, steps, 0.6, 0.6);

                for (const [index, key] of keys.entries()) {
                    // Add tool marker 
                    let tool = {
                        [key]: vals[index]
                    }

                    _this.addMarker(fromLonLat(coords[index]), "tool", missionName, tool);                
                }

            }

            resolve();
        });
    }

    setAreaExtent(coordsStr) {
        let north = parseFloat(coordsStr.split("North ").pop().split("_")[0]);
        let south = parseFloat(coordsStr.split("South ").pop().split("_")[0]);
        let west = parseFloat(coordsStr.split("West ").pop().split("_")[0]);
        let east = parseFloat(coordsStr.split("East ").pop().split("_")[0]);
            
        let newLonLat = [west, north];
        let west_3857 = newLonLat[0];
        let north_3857 = newLonLat[1];
    
        newLonLat = [east, south];
        let east_3857 = newLonLat[0];
        let south_3857 = newLonLat[1];
    
        let extent = [west_3857, south_3857, east_3857, north_3857];

        return extent;
    }

    generateRandomCoordinates(extent) {
        let minX, minY, maxX, maxY;
        [minX, minY, maxX, maxY] = extent;

        let lon = Math.floor(Math.random() * (maxX - minX + 1) + minX);
        let lat = Math.floor(Math.random() * (maxY - minY + 1) + minY);

        return [lon, lat];
    }

    generateCircularCoordinates(center, steps, r = 1, offset = 0.5) {
        let coords = [];

        let radius = r;
        let angle = 0;
        let step = (2 * Math.PI)/steps;

        for (let i=0; i<steps; i++) {
            let lon = radius * Math.sin(angle) + (Math.random() * offset - (offset/2));
            let lat = radius * Math.cos(angle);

            coords.push([lon, lat]);

            angle = angle + step;
        }

        return coords;
    }

    getTools(mission) {
        let tools = [];

        Object.keys(mission).forEach((key, index) => {
            if (key.includes("tool")) {
                if ((mission[key] != "") && (mission[key] != undefined) && (mission[key] != "test") && (mission[key] != " test") && (mission[key] != "NoData") && (mission[key] != "No Data") && (mission[key] != " No Data")) {
                    tools[Object.keys(mission)[index]] = mission[key];
                }
            }
        });

        return(tools);
    }

    getMissionName(mission) {
        let missionName = mission[Object.keys(mission)[0]];
        missionName = missionName.split(" ")[1];

        return missionName;
    }

    getFeatures() {
        let source = this.vectorLayer.getSource();
        let features = source.getFeatures();

        return features;
    }

    getFeature(name) {
        let features = this.getFeatures();
        let feature;

        features.forEach(element => {
            if (element.get("type") == "mission") {
                if (element.get("mission") == name) {
                    feature = element;
                }    
            } 
            
            if (element.get("type") == "tool") {
                let toolName = Object.keys(element.get("tool"))[0];
                if (toolName == name) {
                    feature = element;
                }    
            }
        });

        return feature;
    }

    getFeatureCoordinates(mission) {
        let coords = [];
        let feature = this.getFeature(mission);
        
        coords = feature.getGeometry().getCoordinates();

        return coords;
    }

    showFeature(feature, style = this.iconStyle) {
        feature.setStyle(style);
    }

    hideFeature(feature) {
        feature.setStyle(new Style(null)); 
    }

    removeAllFeatures() {
        this.vectorSource.clear();
    }

    selectFeature(mission) {
        let _this = this;

        let features = this.getFeatures();
        let feature = this.getFeature(mission);

        // If point exists on map
        if (feature != undefined) {
            // If selected feature is a mission
            if (feature.get("type") == "mission") {
                // Zoom and center
                this.views["HOME"].animate(
                    {
                        zoom: 9,
                        center: this.getFeatureCoordinates(mission),
                        duration: 1000,
                        easing: Easing.easeOut,
                    },
                    async function (result) {
                        // Animation end
                        console.log("MISSION SELECTED: ", mission);
                        
                        // Constrain view on mission area extent
                        //_this.map.setView(_this.views[mission]);

                        //let extent = _this.views[mission].calculateExtent(_this.map.getSize());
                        //_this.map.getView().fit(extent, _this.map.getSize());

                        // Hide mission features
                        features.forEach(element => {
                            _this.hideFeature(element);
                        });
                        
                        // Show tools markers
                        for (const [index, element] of _this.data.entries()) {                
                            // Tool points
                            let missionName = _this.getMissionName(element);

                            if (missionName == mission) {
                                await _this.addToolsMarkers(element);
                            }
                        }
                
                    }
                );
            }
        }
    }

    selectToolInfoPanel(mission, tool) {    
        // Get tool element
        let toolElement;
        let missionLinksElements = document.getElementsByClassName("mission-info-link");

        for (let element of missionLinksElements) {
            if (element.getAttribute("data-tool") != null) {
                // If tool element found
                if (element.getAttribute("data-mission") == mission) {
                    if (element.getAttribute("data-tool") == tool) {
                        toolElement = element;
                        // Deselect tool
                        this.deselectToolInfoPanel();

                        // Highlight selected tool in info panel
                        toolElement.classList.add("selected-tool");
                        toolElement.focus();
                    }
                }
            }

        }

    }

    deselectToolInfoPanel() {        
        // Deselect tool
        let selectedToolElements = document.getElementsByClassName("selected-tool");

        while (selectedToolElements.length) {
            selectedToolElements[0].classList.remove("selected-tool");
        }
    }

    showPopupInfo(feature) {
        if (feature != undefined) {
            let mission = feature.get("mission");

            if (feature.get("type") == "tool") {
                let popupCoordinates = feature.getGeometry().getCoordinates();

                this.popup.setPosition(popupCoordinates);
                
                let toolTitleElement = document.createElement("h1");
                toolTitleElement.classList.add("tool-title");
                toolTitleElement.innerHTML = Object.keys(feature.get("tool"))[0].replaceAll("_",  " ").toUpperCase();

                let toolContentElement = document.createElement("p");
                toolContentElement.classList.add("tool-content");
                toolContentElement.innerHTML = Object.values(feature.get("tool"))[0];
                
                // Empty popup content
                this.popUpContent.innerHTML = "";

                this.popUpContent.appendChild(toolTitleElement);
                this.popUpContent.appendChild(toolContentElement);

                console.log("TOOL SELECTED: ", toolContentElement.innerHTML);
            } 
        }
    }

    resetMapView(level = 1, mission) {
        // Reset map view
        if (level == 1) {
            let _this = this;

            let features = this.getFeatures();
            let feature = this.getFeature(mission);
    
            // If point exists on map
            if (feature != undefined) {
                // Remove all mission and tools features
                this.removeAllFeatures();
                
                // Close popup
                this.popup.setPosition(undefined);
                this.popUpCloser.blur();
    
                // Zoom and center
                this.views["HOME"].animate(
                    {
                        center: [0, 0],
                        zoom: 2,
                        duration: 1000,
                        easing: Easing.easeOut,
                    },
                    async function (result) {
                        // Animation end
                        console.log("VIEW RESET");
                                                    
                        // Add mission markers
                        _this.addPointsFromData(_this.data);
                    }
                );
            }

        }
    }
}   

export default OpenLayerMap;