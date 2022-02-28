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
import XYZ from 'ol/source/XYZ';
import {toLonLat, fromLonLat} from 'ol/proj';
import {toStringHDMS} from 'ol/coordinate';

class OpenLayerMap {
    constructor() {
        let _this = this;

        /* Icon */
        this.iconFeature = new Feature({
            geometry: new Point([-3.7, 36.0]),
            //geometry: new Point(fromLonLat([-3.7, 36.0])),
            // name: 'Null Island',
            // population: 4000,
            // rainfall: 500,
        });
        
        
        this.iconStyle = new Style({
            image: new Icon({
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                src: './assets/img/icon.png',
            }),
        });
        
        this.iconFeature.setStyle(this.iconStyle);
        
        this.vectorSource = new VectorSource({
            //features: [iconFeature],
            features: [],
        });
        
        this.vectorLayer = new VectorLayer({
            source: this.vectorSource,
        });
        
        /**
         * Elements that make up the popup.
         */
        this.popUpContainer = document.getElementById('popup');
        this.popUpContent = document.getElementById('popup-content');
        this.popUpCloser = document.getElementById('popup-closer');
        
        /**
         * Create an overlay to anchor the popup to the map.
         */
        this.popup = new Overlay({
            element: this.popUpContainer,
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
         this.popUpCloser.onclick = function () {
            _this.popup.setPosition(undefined);
            _this.popUpCloser.blur();
            return false;
        };
        
        const key = 'inKLFdB7xglu2Az8uVYx';
        const attributions =
            '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
            '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
        
        /**
         * Create the map.
         */
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
        
        // Spherical Mercator: EPSG:3857
        // Lon/Lat coordinates: EPSG:4326
        this.view = new View({
            center: [0, 0],
            zoom: 2,
            //projection: "EPSG:4326"
        })
        
        this.map = new Map({
            layers: [this.mapTiler, this.vectorLayer],
            overlays: [this.popup],
            target: 'map',
            view: this.view
        });
        
        //console.log("MAP: ", map);
        
        /**
         * Add a click handler to the map to render the popup.
         */
        //  this.map.on('singleclick', function (evt) {
        //     const coordinate = evt.coordinate;
        //     const hdms = toStringHDMS(toLonLat(coordinate));
        
        //     _this.popUpContent.innerHTML = '<p>You clicked here:</p><code>' + hdms + '</code>';
        //     _this.overlay.setPosition(coordinate);
        // });
        
        // add marker on click
        // this.map.on('singleclick', function (evt) {
        //   const coordinate = evt.coordinate;
        //   //console.log(coordinate);
        //   //console.log(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'));
        //   _this.addMarker(coordinate);
        // });

        // display popup on click
        this.map.on('click', function (evt) {
            const feature = _this.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                return feature;
            });

            if (feature) {
                let popupCoordinates = feature.getGeometry().getCoordinates();
                popupCoordinates[1] = popupCoordinates[1] + 1700000;
                _this.popup.setPosition(popupCoordinates);
                
                _this.popUpContent.innerHTML = feature.get("mission");

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
        
        // change mouse cursor when over marker
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
    
    addMarker(coordinates, mission = "") {
        let marker = new ol.Feature({
            geometry: new Point(coordinates),
            mission: mission
        });
        marker.setStyle(this.iconStyle);

        this.vectorSource.addFeature(marker);
    }
    
    // Add mission points on map
    addPointsFromData(_data) {
        _data.forEach(element => {
            let coords = [];
            let coordsStr = element.geographic_area_1;

            let mission = element[Object.keys(element)[0]];

            if ((coordsStr != "") && (coordsStr != undefined) && (coordsStr != "test") && (coordsStr != "NoData") && (coordsStr != "No Data")) {
                let lon = parseFloat(coordsStr.split("Longitude ").pop().split("_")[0]);
                let lat = parseFloat(coordsStr.split("Latitude ").pop());
        
                coords.push(lon, lat);
        
                this.addMarker(fromLonLat(coords), mission);
            }
        });
    }
    
}

export default OpenLayerMap;