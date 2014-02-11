//
// open.js by Xavier Irias
// companion file to openlayers.html, a map page built on OpenLayers
//
//
/*
Copyright (c) 2010, East Bay Municipal Utility District
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation and/or
other materials provided with the distribution.

* Neither the name of the East Bay Municipal Utility District nor the names of its contributors
may be used to endorse or promote products derived from this software
without specific prior written permission.


THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 */
var ib;
 
var m_map = null;

var MAPID_SATELLITE      = "SATELLITE";
var MAPID_ROAD           = "ROAD";
var MAPID_TERRAIN        = "TERRAIN";
var MAPID_HYBRID         = "HYBRID";
var MAPID_RELIEF         = "RELIEF";
var MAPID_DEFAULT        = MAPID_ROAD;

var m_DefaultMaptype  = MAPID_DEFAULT;

var m_MapType         = "";  // one of the MAPID_ constants or CUSTOM

var WKID_WGS84 = 4326;                          // basic lat-long referenced to WGS84

// four WKID's that all refer to Web Mercator spherical
var WKID_WEB_MERCATOR_SPHERE = 900913 ;         // read number as google, favored by OpenLayers 2.9
var WKID_WEB_AUXILLIARY      = 102100;          // preferred for ArcGIS93, but hated by OpenLayers
var WKID_WEB_MERCATOR_ARCGIS = 3857;            // preferred for ArcGIS10 and later, hated by all other version, also hated by OpenLayers
var WKID_WEB_OLDARCGIS       = 102113;          // preferred by really old ESRI, now deprecated by ESRI, hated by OpenLayers

// a map's layers must in general be either Web Mercator, or geographic, but not a mix
// Unfortunately there are synonyms so determining whether layers are compatible requires use of these arrays
// Note that the first element of each array is taken as the canonical WKID and synonyms are forced to be identical
var m_WKID_Mercator   = [WKID_WEB_MERCATOR_SPHERE, WKID_WEB_AUXILLIARY, WKID_WEB_MERCATOR_ARCGIS,WKID_WEB_OLDARCGIS];
var m_WKID_Geographic = [WKID_WGS84];


var WKID_DISPLAY = WKID_WGS84;  // cursor coords in lat-long rather than web mercator

var WKID_DEFAULT = WKID_WEB_MERCATOR_SPHERE; // but basic map is in web mercator

//var WKID_DEFAULT = WKID_WGS84; //WKID_WEB_MERCATOR_SPHERE;

var m_UseSphericalMercator=false;
var m_graticule=null;


var URL_BOUNDARY = "http://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer";
var URL_MODIS    = "http://wms.jpl.nasa.gov/wms.cgi?";


// define various stock layers.  various properties all self-explanatory
// except wkid, which is an array of wkid's that are supported by the indicated server
// This has implications for the combinations which are possible since layers must generally be all
// lat-long WGS84, or all web mercator spherical.

var OSM_STREET = {name: "Open street map", type: "OSM", url: null, wkid: [WKID_WEB_MERCATOR_SPHERE]};

var WMS_WEATHER = {name: "Weather", url:"http://gis.srh.noaa.gov/ArcGIS/services/watchWarn/MapServer/WMSServer",
    type: "WMS", wkid:[WKID_WEB_MERCATOR_SPHERE], layers:"nexrad-n0r-900913"};
var WMS_SAT   = {name: "Satellite", type: "WMS", url: "http://raster.nationalmap.gov/arcgis/services/Combined/USGS_EDC_Ortho_NAIP/ImageServer/WMSServer",
    wkid: [WKID_WEB_OLDARCGIS, WKID_WEB_MERCATOR_SPHERE, WKID_WGS84], layers: "0"};
var WMS_STREET = {name:"WMS Street map", type: "WMS", url: "http://vmap0.tiles.osgeo.org/wms/vmap0", wkid: [WKID_WEB_MERCATOR_SPHERE, WKID_WGS84], 
    layers: "basic", format: "image/png"};
var WMS_TOPO   = {name:"Topo", type: "WMS", url: "http://services.nationalmap.gov/ArcGIS/services/US_Topo/MapServer/WMSServer",
    wkid: [WKID_WGS84], layers: "basic"};
var WMS_LIZARD = {name: "LizardTech orthoimagery", type: "WMS", url: "http://wms.lizardtech.com/lizardtech/iserv/ows",
    wkid: [WKID_WGS84, WKID_WEB_MERCATOR_ARCGIS, WKID_WEB_MERCATOR_SPHERE], layers: "usa_srtm, bmng.200412.topobathy"};

var WMTS_NATURAL_EARTH = {name: "WMTS test", url: "http://server.caris.com/spatialfusionserver/services/ows/wmts/NaturalEarth", type: "WMTS",
    layers: "newworld", wkid:[WKID_WGS84]};

var WMS_DRG   = {name: "DRG", type: "WMS", url: "http://raster.nationalmap.gov/arcgis/services/DRG/TNM_Digital_Raster_Graphics/MapServer/WMSServer",
    wkid: [WKID_WEB_OLDARCGIS, WKID_WEB_MERCATOR_SPHERE, WKID_WGS84], layers: "0"};

var WMS_USGSTOPO = {name: "USGS Topo", type: "WMS", url: "http://terraservice.net/ogcmap.ashx?", layers: "DRG", wkid:[WKID_WEB_MERCATOR_SPHERE]};

var WMS_RELIEF = {name: "Shaded relief", type: "WMS", url: "http://imselev.cr.usgs.gov:80/wmsconnector/com.esri.wms.Esrimap/USGS_EDC_Elev_NED?",
    layers: "CONUS_RELIEF64", wkid: [WKID_WEB_OLDARCGIS]};

var BING_ROAD = {id: "BING_ROAD", name: "Bing roads", type: "BING",
    wkid: [WKID_WEB_MERCATOR_SPHERE], params: {type:"Road"}
};
var BING_SAT = {id: "BING_SAT", name: "Bing satellite", type: "BING",
    wkid: [WKID_WEB_MERCATOR_SPHERE], params: {type:"Aerial"}
};
var BING_HYBRID = {id: "BING_HYBRID", name: "Bing hybrid", type: "BING",
    wkid: [WKID_WEB_MERCATOR_SPHERE], params: {type:"AerialWithLabels"}
};

var ESRI_RELIEF = {
    name: "Relief", type: "ARC",
    url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
    wkid: [WKID_WEB_MERCATOR_SPHERE],
    params: {resolutions : [
                        156543.033928,
                        78271.5169639999,
                        39135.7584820001,
                        19567.8792409999,
                        9783.93962049996,
                        4891.96981024998,
                        2445.98490512499,
                        1222.99245256249,
                        611.49622628138,
                        305.748113140558,
                        76.4370282850732,
                        38.2185141425366,
                        19.1092570712683,
                        9.55462853563415,
                        4.77731426794937,
                        2.38865713397468,
                        1.19432856685505,
                        ]}
      };

var ESRI_SAT = {
    name: "Sat", type: "ARC",
    url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
    wkid: [WKID_WEB_MERCATOR_SPHERE],
    params: {dynamic: true}
      };

var ESRI_OVERLAY = {
    name: "Overlay", type: "ARC",
    url : "http://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer",
    wkid: [WKID_WEB_MERCATOR_SPHERE],
    params: {dynamic: true}
};

// /${z}/${x}/${y}.png
// 
// Create a WMTS layer, with given matrix IDs.
	

var WMTS_WORLD = function() {
    function generateMatrixArray() {
        var matrixIds = [];
        for (var i=0; i<=18; ++i) {
            matrixIds.push({identifier: "" + i});
        }
        return matrixIds;
    }
    return {
    name: "WMTS ERDAS",
    url: "http://iws.erdas.com/ecwp/ecw_wmts.dll?",
    layer: "sampleiws_images_geodetic_worldgeodemo.ecw",
    matrixSet: "ogc:1.0:googlemapscompatible",
    matrixIds: generateMatrixArray(),
    format: "image/jpeg",
    style: "",
    isBaseLayer: false,
    opacity: 0.7
    };
}();

var m_MapTypes = [
    {mapID: MAPID_SATELLITE, name: "ESRI satellite imagery",
        layers: [
            {type: ESRI_SAT.type, name: ESRI_SAT.name, url:ESRI_SAT.url, wkid: ESRI_SAT.wkid, params: ESRI_SAT.params}
        ]
    },
    {mapID: MAPID_ROAD, name: "Open Street Map", wkid: WKID_WEB_MERCATOR_SPHERE,
        layers: [{name: OSM_STREET.name, type: OSM_STREET.type}]},
    {mapID: MAPID_TERRAIN, name: "ESRI Terrain",
        layers: [
            {type: ESRI_RELIEF.type, name: ESRI_RELIEF.name, url:ESRI_RELIEF.url, wkid: ESRI_RELIEF.wkid, params: ESRI_RELIEF.params}
            //,{name: OSM_STREET.name, type: OSM_STREET.type}
        ]
    },
    {mapID: MAPID_HYBRID, name: "ESRI satellite imagery with labels",
        layers: [
            {name: ESRI_SAT.name, type: ESRI_SAT.type, url:ESRI_SAT.url, wkid: ESRI_SAT.wkid, params: ESRI_SAT.params}
            ,
            {name: ESRI_OVERLAY.name, type: ESRI_OVERLAY.type, url:ESRI_OVERLAY.url, wkid: ESRI_OVERLAY.wkid, params: ESRI_OVERLAY.params}
        ]
    },
    {mapID: "USGS Quad", name: "USGS Quad",
        layers: [{url: WMS_DRG.url, type: "WMS", wkid: WMS_DRG.wkid, layers: WMS_DRG.layers, name: WMS_DRG.name}]
    },
    {mapID: BING_ROAD.id, name: BING_ROAD.name, type: "BING",
        layers: [{name: BING_ROAD.name, type: BING_ROAD.type, params: BING_ROAD.params}]},

    {mapID: BING_SAT.id, name: BING_SAT.name, type: "BING", layers: [
            {name: BING_SAT.name, type: BING_SAT.type, params: BING_SAT.params}
        ]},
    {mapID: BING_HYBRID.id, name: BING_HYBRID.name, type: "BING", layers: [
            {name: BING_HYBRID.name, type: BING_HYBRID.type, params: BING_HYBRID.params}]},
    {mapID: "WMS_STREET", name: "WMS road map", type: "WMS",
        layers: [
            {name: WMS_STREET.name, url: WMS_STREET.url, type: WMS_STREET.type, layers: WMS_STREET.layers, wkid: WMS_STREET.wkid}]
    },
    {mapID: MAPID_SATELLITE, name: "WMS Satellite",
        layers: [
            {type: WMS_STREET.type, name: WMS_STREET.name, url: WMS_STREET.url,
            layers: WMS_STREET.layers, format: WMS_STREET.format},

            {type: WMS_SAT.type, name: WMS_SAT.name, url: WMS_SAT.url, layers: WMS_SAT.layers, wkid: WMS_SAT.wkid, opacity: 0.5,
                format: "image/png"
            }
        ]
    },
    {mapID: MAPID_RELIEF, name: "WMS Relief",
        layers: [
            {type: WMS_RELIEF.type, name: WMS_RELIEF.name, url:WMS_RELIEF.url, layers: WMS_RELIEF.layers, wkid: WMS_RELIEF.wkid
            }
        ]
    },
    {mapID: "WMTS_TEST", name: "Street map with demographic shading (WMTS)",
        layers: [{name: OSM_STREET.name, type: OSM_STREET.type},
            {name: WMTS_WORLD.name, url: WMTS_WORLD.url, type: "WMTS",
                layer: WMTS_WORLD.layer,
                matrixSet: WMTS_WORLD.matrixSet,
                matrixIds: WMTS_WORLD.matrixIds,
                opacity: WMTS_WORLD.opacity,
                format: WMTS_WORLD.format,
                requestEncoding: WMTS_WORLD.requestEncoding
            }
        ]
    }
];

function isMapWebMercator() {
    return m_UseSphericalMercator;
}

function createMapPt(latitude, longitude) {
    // note that inputs are always lat-long
    // and return value is a point in the map's spatial ref, which might be different

    var point = createLatLongPt(latitude, longitude);

    // however output point object must be in map coords, which might not be lat-long
    // so convert if needed
    
    if( m_map && m_map.getProjectionObject()) {
        
        var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);
        point.transform(proj, m_map.getProjectionObject());
    
    }
    return point;
}
function createLatLongPt(latitude, longitude) {
    // note that inputs are always lat-long
    // and return value is a point in the map's spatial ref, which might be different

    var point = new OpenLayers.LonLat(longitude, latitude);

    return point;
}
function toLonLat(geo) {
	try {
    var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);
    geo.transform(m_map.getProjectionObject(), proj);
    return geo;
	}
	catch(ex) {
		console.log("ERROR", geo, ex)
	}
}
function toMapCoords(geo) {
    var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);
    geo.transform(proj, m_map.getProjectionObject());
    return geo;
}

function extentsFromString(extentString, proj) {
    try {
        // extentString passed as a URL param
        // as latMin | longMin | latMax | longMax

        var extent=null;


        if( extentString ) {
            MARCONI.stdlib.log("Setting explicit extents");

            var pts = extentString.split("|");

            if( pts.length == 4) {
                   // provide extents as longMin, latMin, longMax, latMax
                    extent = new OpenLayers.Bounds(
                        pts[1], pts[0], pts[3], pts[2]);
            }
        }

        if( !extent ) {

            MARCONI.stdlib.log("Setting default extents");

            extent = new OpenLayers.Bounds(
                defaultLongitude()-.5, defaultLatitude()-.5, defaultLongitude()+.5,defaultLatitude()+.5);

        }

        // transform to required projection if not basic WGS84 lat-long

        if( proj && proj.getCode() != "EPSG: " + WKID_WGS84 ) {

            var fromProj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);

            extent.transform(fromProj, proj);
        
            MARCONI.stdlib.log("Transformed map extents are " + extent.left + ", " + extent.bottom + " to " + extent.right + ", " + extent.top);

        }
        else {
            MARCONI.stdlib.log("WGS84 map extents are " + extent.left + ", " + extent.bottom + " to " + extent.right + ", " + extent.top);

        }

        return extent;

    }
    catch(ex) {
        throw "Error defining map extents: " + ex;
    }
}

var m_layerLoadStatus=null;

function setMapType(mapTypeCD) {
    function initLoad(mapTypeCD) {
        // initialize layer load status

        if( mapTypeCD ) {
            MARCONI.stdlib.listboxSynchToValue("cbMapType", mapTypeCD);
        }
        var mapType = MARCONI.stdlib.listboxSelectedItem("cbMapType");

        m_layerLoadStatus=[];
        for( i = 0 ; i < mapType.mapInfo.layers.length ; i++) {
            m_layerLoadStatus.push(false);
        }

       // clear any existing layers
       if( m_map.layers && m_map.layers.length ) {

           MARCONI.stdlib.log("Removing " + m_map.layers.length + " existing layers");

           for( i=m_map.layers.length-1 ; i >= 0 ; i--) {
               
               MARCONI.stdlib.log("Removing layer " + m_map.layers[i].name);

               m_map.removeLayer(m_map.layers[i], true);
           }
        }
        return mapType;

    }


    // Note that this function is re-entrant because of the fact that some layers load asynchronously
    // for such layers, after starting a load they they set m_layerLoadStatus[i] to a truthy value then return
    // and upon finishing their layer load, they simply call setMapType() to cause another pass through layers looking for unloaded layers
    // The load status array is set to null when all layers are done
    try {
        if(!m_map) {
            MARCONI.stdlib.log("map not ready, cannot set type " + mapTypeCD);
            return;
        }

        var options;
        var params;
        var i;
        var mapType;

        // if not already in the processing of loading (since some layers load asynch)
        if( !m_layerLoadStatus) {
            mapType = initLoad();
        }
        else {
            mapType = MARCONI.stdlib.listboxSelectedItem("cbMapType");  // an object not a string
        }
        
        if( !mapType || !mapType.mapInfo ) {
            throw("Missing maptype info");
        }
        
        var newLayer;
        var isBaseSet=false;

        MARCONI.stdlib.log("Prior to loading/reloading layers, map has " + m_map.getNumLayers() + " layers");

        if( mapType.mapInfo.isCustom) {
            MARCONI.stdlib.log("Custom map layer(s) " + mapType.mapInfo.name + " being applied...");
        }

        for( i = 0 ; i < mapType.mapInfo.layers.length ; i++) {

            if( !m_layerLoadStatus[i] ) {

                // for first layer, set map wkid to match first layer, if specified for the layer
                // all subsequent layers must be compatible of course

                if( i==0 ) {
                    options = {
                    projection: new OpenLayers.Projection("EPSG:" + WKID_DEFAULT)
                    ,displayProjection: new OpenLayers.Projection("EPSG:" + WKID_WGS84)
                    ,minResolution: "auto"
                    ,minExtent: new OpenLayers.Bounds(-1, -1, 1, 1)
                    ,maxResolution: "auto"
                    ,maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508)
                    ,allOverlays: false
                    };

                    MARCONI.stdlib.log("Setting map projection to " + WKID_DEFAULT);

                    m_map.setOptions(options);
                }
                else {
                    options={};
                }

                MARCONI.stdlib.log("Layer type" + i + ": " + mapType.mapInfo.layers[i].type);

                newLayer=null;
                var url = mapType.mapInfo.layers[i].url;
                params  = mapType.mapInfo.layers[i].params  || {};
                var opacity = mapType.mapInfo.layers[i].opacity;

                switch( mapType.mapInfo.layers[i].type.toUpperCase() ) {
                    // KML omitted from map sample
                    
                    case "TMS":  // Tile Map Server
                        newLayer = new OpenLayers.Layer.TMS(mapType.mapInfo.name, url, params);

                        break;

                    case "OSM":  // Open Street Map or compatible tileset
                        params.opacity = opacity || (i==0 ? 1.0 : 0.4);

                        if( url && mapType.mapInfo.isCustom) {
                            url += "/${z}/${x}/${y}.png";
                            params.numZoomLevels= 18;
                        }

                        // default url is hardwired into OpenLayers, to hit an OpenStreetMap server somewhere
                        // so only specify it when we want custom tileset
                        if( url ) {
                            newLayer = new OpenLayers.Layer.OSM(mapType.mapInfo.layers[i].name, url, params);
                        }
                        else {
                            newLayer = new OpenLayers.Layer.OSM(mapType.mapInfo.layers[i].name, null, params);
                        }

                        break;

                    case "BING":
                        var apiKey = document.getElementById("BingMapKey").value;
                        
                        if(!apiKey) {
                            throw "Bing map key not provided";
                        }

                        newLayer = new OpenLayers.Layer.Bing({
                            key: apiKey,
                            type: mapType.mapInfo.layers[i].params.type
                        });
                        break;
                 
                    case "ARC":  // ArcGIS cache layer -- not the same as an ArcIMS service
                        if( params.dynamic ) {
                            function initMap(layerInfo, url, name, index) {
                                MARCONI.stdlib.log("Received JSONP callback with metadata for " + url);

                                var theLayer = new OpenLayers.Layer.ArcGISCache(name, url, {
                                    layerInfo: layerInfo,
                                    format:  "PNG"
                                });

                                var opt = {
                                    maxExtent: theLayer.maxExtent,
                                    units: theLayer.units,
                                    resolutions: theLayer.resolutions,
                                    numZoomLevels: theLayer.numZoomLevels,
                                    tileSize: theLayer.tileSize,
                                    displayProjection: theLayer.displayProjection,
                                    StartBounds: theLayer.initialExtent
                                };

                                m_map.setOptions(opt);
                                m_map.addLayer(theLayer);

                                MARCONI.stdlib.log("Added new layer " + url + ", map now has " + m_map.getNumLayers() + " layers");

                                return theLayer;
                            }

                            var jsonp = new OpenLayers.Protocol.Script();
                            var callBackUrl=url;
                            var callBackName=mapType.mapInfo.layers[i].name;
                            m_layerLoadStatus[i]="PENDING";

                            jsonp.createRequest(url, {
                                f: 'json',
                                pretty: 'true'
                                },
                                function(layerInfo) {
                                    var theNewLayer = initMap(layerInfo, callBackUrl, callBackName);
                                    if(i==0 && theNewLayer ) {
                                        theNewLayer.isBaseLayer=true;
                                    }

                                    MARCONI.stdlib.log("After ArcGIS asynch layer, now map has: " + m_map.layers.length + " layers");

                                    setMapType();  // recursive call
                                }
                            );

                            return;  // callback will pick up where we left off
                        }
                        else {
                            params.tileOrigin = new OpenLayers.LonLat(-20037508.342787 , 20037508.342787);  // upper left

                            // layer max extent not quite same as map max extent
                            // may have to make this user-specified if it ends up varying for different ArcGIS tilesets
                            params.maxExtent = new OpenLayers.Bounds(
                                -20037507.0671618,
                                -19971868.8804086,
                                20037507.0671618,
                                19971868.8804086);

                            newLayer = new OpenLayers.Layer.ArcGISCache(
                                mapType.mapInfo.layers[i].name,
                                url,
                                params);
                        }
                    
                        break;


                    case "WMS":
                        options = mapType.mapInfo.layers[i].options || {};
                        params  = mapType.mapInfo.layers[i].params  || {};

                        options.sphericalMercator = true;
                        options.opacity = (options.opacity || opacity) || 0.4;
                        options.isBaseLayer = (i==0 ? true : false);
                        if( mapType.mapInfo.layers[i].format ) {
                            params.format = mapType.mapInfo.layers[i].format;
                        }
                        if( mapType.mapInfo.layers[i].layers ) {
                            params.layers = mapType.mapInfo.layers[i].layers;
                        }
                        else {
                            MARCONI.stdlib.log("WMS Layer spec is missing")
                        }

                        MARCONI.stdlib.log("Loading WMS layer with params:" + MARCONI.stdlib.logObject(params));

                        if( mapType.mapInfo.layers[i].wkid && mapType.mapInfo.layers[i].wkid[0] != WKID_DEFAULT ) {
                            options.sphericalmercatoralias = mapType.mapInfo.layers[i].wkid[0];
                        }

                        newLayer = new OpenLayers.Layer.WMS(
                            mapType.mapInfo.layers[i].name,
                            mapType.mapInfo.layers[i].url,
                            params,
                            options);

                        newLayer.getFullRequestString = function(newParams, altUrl) {
                            var projectionCode = this.map.getProjection();
                            var value = (projectionCode == "none") ? null : projectionCode

                            if (this.options.sphericalmercatoralias) {
                                value = "EPSG:" + this.options.sphericalmercatoralias;
                            }

                            if (parseFloat(this.params.VERSION) >= 1.3) {
                                this.params.CRS = value;
                            }
                            else {
                                this.params.SRS = value;
                            }

                            return OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(this, arguments);
                        };

                        break;

                    case "WMTS":  // WMS Tile
                        var constructArgs = {
                            name : mapType.mapInfo.layers[i].name,
                            url: mapType.mapInfo.layers[i].url,
                            layer: mapType.mapInfo.layers[i].layer,
                            style: mapType.mapInfo.layers[i].style || "",
                            matrixSet: mapType.mapInfo.layers[i].matrixSet,
                            matrixIds: mapType.mapInfo.layers[i].matrixIds,
                            format: mapType.mapInfo.layers[i].format || "image/jpeg",
                            tileSize : new OpenLayers.Size(256, 256),
                            opacity: mapType.mapInfo.layers[i].opacity,
                            isBaseLayer: mapType.mapInfo.layers[i].isBaseLayer || false
                        };
                
                        MARCONI.stdlib.log("Loading WMTS layer with params:" + MARCONI.stdlib.logObject(constructArgs));

                        newLayer = new OpenLayers.Layer.WMTS(constructArgs);

                    break;

                default:
                    MARCONI.stdlib.log("Don't know how to load layer type " + mapType.mapInfo.layers[i].type);
                    newLayer=null;

            }
            if( newLayer ) {
                m_layerLoadStatus[i]="COMPLETED";

                MARCONI.stdlib.log("Loading layer type " + mapType.mapInfo.layers[i].type);

                m_map.addLayer(newLayer);

                if(!isBaseSet) {
                    MARCONI.stdlib.log("Setting new layer as base ");
                    
                    m_map.setBaseLayer(newLayer);
                    
                    isBaseSet=true;
                }
            }
        }
    }

    MARCONI.stdlib.log("Map has " + m_map.getNumLayers() + " layers:");
    // describe new layers
    for( i=0 ; i < m_map.layers.length ; i++) {
        MARCONI.stdlib.log("Layer " + m_map.layers[i].name + (m_map.layers[i].isBaseLayer ? ", base" : ", not a base") );
    }
    
    if( m_editingLayer) {
        m_map.addLayer(m_editingLayer);
    }

    m_map.updateSize();

    MARCONI.stdlib.log("Map updated, projection is " + (m_map.getProjectionObject() ? m_map.getProjectionObject().toString() : " not defined"));

    m_layerLoadStatus=null;  // a normal completion of layer loading, so null out to show we are not in process of loading layers
    
    if(ib){
    	ib.setupLayers(ib.maps);
    	if(ib.markers) ib.updateMarkers(ib.markers);
    }
  }
  catch(ex) {
      alert("Error setting map type: " + ex);
  }

}

function onLoad(callback){
    function populateMapTypes() {
        var diag="";

        try {
            m_MapType = MARCONI.stdlib.paramValue("MapType", m_DefaultMaptype);

            var cb = document.getElementById("cbMapType");
            MARCONI.stdlib.listboxClear(cb);
            
            
            MARCONI.stdlib.log("Creating dropdownlist of " + m_MapTypes.length + " maps in all");

            // load up map selector with mix of stock types and optional custom type

            for( var i = 0 ; i < 2/*m_MapTypes.length*/ ; i++ ) {

                MARCONI.stdlib.log("type is " + m_MapTypes[i].type);
                
                if( m_MapTypes[i].type != "BING" || document.getElementById("BingMapKey").value) {
                    var newItem = MARCONI.stdlib.listboxAddItem(cb, m_MapTypes[i].name, m_MapTypes[i].mapID);

                    // set custom property
                    newItem.mapInfo = m_MapTypes[i];
                }
            }
            MARCONI.stdlib.log("Selecting map type " + m_MapType);
            MARCONI.stdlib.listboxSynchToValue("cbMapType", m_MapType);
        }
        catch(ex) {
            throw "Error populating map type listbox: " + ex + (diag ? ", " + diag : "");
        }
    }
    function initSizeControls() {
        try {
            document.getElementById("chkForceDefaultSize").checked = m_ForceDefaultSize;

            // show linear units list if editing a non-point feature
            if( m_ItemToEdit && m_ItemToEdit != "POINT" ) {
                MARCONI.map.populateUnitsList("cbLinearUnits",null, "linear");
                MARCONI.stdlib.listboxSynchToValue("cbLinearUnits", m_DistanceUnits);

                document.getElementById("cbLinearUnits").onchchange = function() {
                   beginOrContinueEditing(null, {whatChanged: "SETTINGS", reason:"Linear units changed"});
                   genericMapReportLinearUnitsUpdate(MARCONI.stdlib.listboxSelectedValue("cbLinearUnits"));
                };
            }
            else {
                document.getElementById("divLinear").style.display = "none";
            }

            // show aereal units list if editing a feature with area, i.e. not a point or a line
            if( m_ItemToEdit && m_ItemToEdit != "LINE" && m_ItemToEdit != "POINT" ) {

                MARCONI.map.populateUnitsList("cbArealUnits", null, "areal");

                MARCONI.stdlib.listboxSynchToValue("cbArealUnits", m_ArealUnits);

                document.getElementById("cbArealUnits").onchchange = function() {
                   beginOrContinueEditing(null, {reason:"Aereal units changed"})};

            }
            else {
                document.getElementById("divAreal").style.display = "none";
            }

			document.getElementById("scan").onclick = function(){ ib.scan(); };

            // if readonly, leave only the units selection boxes visible
            // i.e., we don't need the sizing stuff
            if( m_ReadOnly ) {
                document.getElementById("valueDiv").style.display = "none";
                document.getElementById("forceDiv").style.display = "none";
                document.getElementById("sizeDiv").style.display = "block";

            }
            else if( m_ItemToEdit) {
                if( m_ItemToEdit != "POINT") {  // when force checkbox is toggled, we need to consider updating
                    document.getElementById("chkForceDefaultSize").onclick = function() {
                        if( m_EditingControl && m_EditingControl.mode ) {
                            MARCONI.stdlib.log("adjusting edit control mode");
                            if( document.getElementById("chkForceDefaultSize").checked ) {
                                m_EditingControl.mode = OpenLayers.Control.ModifyFeature.DRAG;
                            }
                            else {
                                m_EditingControl.mode = OpenLayers.Control.ModifyFeature.RESHAPE | OpenLayers.Control.ModifyFeature.DRAG;
                            }
                        }
                        beginOrContinueEditing(null, {reason: "Force-size checkbox changed state"});
                        };
                }

                switch( m_ItemToEdit ) {
                    case "CIRCLE":
                        document.getElementById("widthDiv").style.display="none";
                        document.getElementById("heightDiv").style.display="none";
                        document.getElementById("sizeDiv").style.display="block";
                        document.getElementById("Radius").value = m_DefaultRadius;
                        document.getElementById("Radius").onchange = function() {
                            beginOrContinueEditing(null, {reason: "radius changed"});
                            genericMapReportRadiusUpdate(document.getElementById("Radius").value);
                     
                        };
                        break;

                    case "EXTENTS":
                        document.getElementById("radiusDiv").style.display="none";
                        document.getElementById("sizeDiv").style.display="block";
                        document.getElementById("Width").value = m_DefaultExtentsWidth;
                        document.getElementById("Height").value = m_DefaultExtentsHeight;
                        document.getElementById("Width").onchange = function() {
                            beginOrContinueEditing(null, {reason: "width changed"});
                            genericMapReportWidthUpdate(document.getElementById("Width").value);
                     
                        };
                        document.getElementById("Height").onchange = function() {
                            beginOrContinueEditing(null, {reason: "height changed"});
                            genericMapReportHeightUpdate(document.getElementById("Height").value);
                        };

                        break;

                    case "POLYGON":
                    case "LINE":
                        document.getElementById("forceDiv").style.display="none";
                        document.getElementById("valueDiv").style.display="none";
                        document.getElementById("sizeDiv").style.display="block";
                        break;

                    case "POINT":
                        // leave sizeDiv hidden

                }
            }

        }
        catch(ex) {
            throw "Error initializing size controls: " + ex;
        }

        
    }
    function initVariables() {
        window.m_ItemToEdit=MARCONI.stdlib.paramValue("ItemToEdit", "").toUpperCase();     // options are POINT, EXTENTS, CIRCLE, LINE, POLYGON
        window.m_DistanceUnits=MARCONI.stdlib.paramValue("LinearUnitCD", MARCONI.map.UNITS_METERS);
        window.m_ArealUnits=(m_DistanceUnits==MARCONI.map.UNITS_METERS ? MARCONI.map.UNITS_HECTARES : MARCONI.map.UNITS_ACRES);
        window.m_ReadOnly=MARCONI.stdlib.paramValue("ReadOnly", false);
        window.m_editingLayer=null;
        window.m_GeometryObject=null;
        window.m_EditingControl=null;
        window.m_EditLayerID=null;
        window.m_SelectorLayerID=null;
        window.m_DefaultRadius = MARCONI.stdlib.paramValue("Radius",1000);
        window.m_DefaultExtentsWidth=MARCONI.stdlib.paramValue("Width",1000);
        window.m_DefaultExtentsHeight=MARCONI.stdlib.paramValue("Height",1000);
        window.m_ForceDefaultSize=(MARCONI.stdlib.paramValue("DefaultSize")=="true");
        window.m_EditingStarted=false;
        window.m_mapExtentString = MARCONI.stdlib.paramValue("MapExtent");
        
        // default grid style 
        window.m_GridStyle = {
            majorLineColor: "#1f5779",
            majorLineWeight: 3,
            majorLineOpacity: 1,
            
            semiMajorLineColor: "#206590",
            semiMajorLineWeight: 2,
            semiMajorLineOpacity: 1,
            
            minorLineColor: "#FFF",
            minorLineWeight: 1,
            minorLineOpacity: 1,
            
            fineLineColor: "#206590",
            fineLineWeight: 1,
            fineLineOpacity: 1,

            majorLabelColor:"#fff",
            majorLabelOpacity: 1,
            majorLabelFont: "arial",
            majorLabelSize: "18pt",
            majorLabelWeight: "bolder",
            majorLabelStyle: "italic",
            
            
            semiMajorLabelColor: "rgb(99, 193, 252)",
            semiMajorLabelOpacity: 1,
            semiMajorLabelFont: "Arial",
            semiMajorLabelSize: "16pt",
            semiMajorLabelWeight: "bold",
            semiMajorLabelStyle: "small",
            
            minorLabelColor:     "#FFF",
            minorLabelOpacity:  1,
            minorLabelSize: "12pt",
            minorLabelFont: "Arial",
            minorLabelWeight: "normal",
            minorLabelStyle: "normal",
            
            fineLabelColor: "#FFF",
            fineLabelOpacity: 1,
            fineLabelSize: "10pt",
            fineLabelFont: "Arial",
            fineLabelWeight: "normal",
            fineLabelStyle: "normal"
            
        };
        
    }
    
    try {
        initVariables();
        
        MARCONI.stdlib.log("Initializing OpenLayers map with library version " + OpenLayers.VERSION_NUMBER);
        
        OpenLayers.Projection.addTransform("EPSG:4326", "EPSG:900913", OpenLayers.Layer.SphericalMercator.projectForward);
        OpenLayers.Projection.addTransform("EPSG:900913", "EPSG:4326", OpenLayers.Layer.SphericalMercator.projectInverse);


        // set transformation functions from/to wkid 3857 since it's a synonym for wkid 900913
        OpenLayers.Projection.addTransform("EPSG:4326", "EPSG:3857", OpenLayers.Layer.SphericalMercator.projectForward);
        OpenLayers.Projection.addTransform("EPSG:3857", "EPSG:4326", OpenLayers.Layer.SphericalMercator.projectInverse);

        // also set transformation functions from/to wkid 102100 since it's a near-synonym for 3857/900913
        OpenLayers.Projection.addTransform("EPSG:4326", "EPSG:102100", OpenLayers.Layer.SphericalMercator.projectForward);
        OpenLayers.Projection.addTransform("EPSG:102100", "EPSG:4326", OpenLayers.Layer.SphericalMercator.projectInverse);


        populateMapTypes();

        document.getElementById("cbMapType").onchange = setMapType;
        
        var controls = [
            new OpenLayers.Control.Navigation(),
/*
            new OpenLayers.Control.OverviewMap({autoPan:true, maximized: true,
                layers: [new OpenLayers.Layer.OSM()]
                }),
            new OpenLayers.Control.LayerSwitcher(),
*/
            new OpenLayers.Control.PanZoomBar(),
            new OpenLayers.Control.KeyboardDefaults()
            ];

        var options = {
            div: "mapDiv",
            controls: controls,
            projection: new OpenLayers.Projection("EPSG:" + WKID_DEFAULT)
            ,displayProjection: new OpenLayers.Projection("EPSG:" + WKID_WGS84)
            ,minResolution: "auto"
			,minExtent: new OpenLayers.Bounds(-1, -1, 1, 1)
            ,units:"m"
			,maxResolution: 156543.0339
			,maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34 )
        };

        m_map = new OpenLayers.Map(options);
        
        MARCONI.stdlib.log("created map: " + (m_map.getProjectionObject() ? m_map.getProjectionObject().toString() : ", no projection"));

        setMapType(m_MapType);

        MARCONI.stdlib.log("now map proj is: " + m_map.getProjectionObject().toString());

        
        // note that extents will be in a spatial ref that may not be a simple geographic (lat-long) system
        var extent = extentsFromString(m_mapExtentString, m_map.getProjectionObject());  
        
        MARCONI.stdlib.log("Zooming to extent " + extent.left + ", " + extent.bottom + " to " + extent.right + ", " + extent.top +
            " with projection " + m_map.getProjectionObject().toString() + ", default is EPSG:" + WKID_DEFAULT);


        m_map.zoomToExtent(extent, true);
   		m_map.zoomTo(14);

        if( !m_ItemToEdit && genericMapInitialLatLong()) {
            m_ItemToEdit="POINT";
        }
        
        // create size controls 
        initSizeControls();
        
        // setup misc event handlers
        // capture mouse click, and within click handler route it further to editing control if needed
        var click = new OpenLayers.Control.Click();
        m_map.addControl(click);
        click.activate();


        m_map.events.register("mousemove", m_map, function(e) {      
            var position = toLonLat(m_map.getLonLatFromPixel(e.xy));
            showMouseCoordinates(position);
        });

        document.getElementById("cbGraticule").onchange = initGrid;
        document.getElementById("cmdFind").onclick = locate;
        document.getElementById("cmdFind").disabled = false;
        
        m_map.events.register( "zoomend", m_map,  function() { 
            if( m_graticule ) {
                m_graticule.draw();
            }
        });
        
        m_map.events.register( "moveend", m_map,  function() { 
            if( m_graticule ) {
                m_graticule.draw();
            }
        });
        
        // grid may be specified in the URL, or selected via the dropdown list
        MARCONI.stdlib.listboxSynchToValue("cbGraticule", MARCONI.stdlib.paramValue("grid","").toUpperCase());
        initGrid();
        
        // if editing existing geometry, draw that geometry
        // and either way, setup event handlers for editing
        beginOrContinueEditing(genericMapInitialLatLong(), {initialDraw: true, reason: "Initial call"});  

		//setMapType("SATELLITE");

    }
    catch(ex) {
        MARCONI.stdlib.log("Error initializing OpenLayers: " + ex);
    }
    
    if(callback instanceof Function)
    	callback.call();
}
function formatLocation(latLong) {
    try {
        
        var gridName = MARCONI.stdlib.listboxSelectedValue("cbGraticule");
        
        var gridValue = m_graticule && m_graticule.gridValueFromPt ?
            m_graticule.gridValueFromPt(latLong) : "";
    
        var usng = gridName=="USNG" ? gridValue : USNG.LLtoUSNG(latLong.lat, latLong.lon);

        var dm = (gridName=="LATLONG_DM" ? gridValue : MARCONI.map.decimalDegreesToDM(latLong.lat, 3) + ", " + 
            MARCONI.map.decimalDegreesToDM(latLong.lon, 3));
        
        var ice = usng.split(" ");
        ice[2] = ice[2].substr(0,3);
        ice[3] = ice[3].substr(0,3);
                
//        return dm + ", MGRS: " + usng + (gridValue && gridName != "LATLONG_DM" && gridName != "USNG" ? ", Grid: " + gridValue : "");
		return "GPS "+ String(latLong.lat).substr(0,10) + 
			"," + String(latLong.lon).substr(0,10) + 
			" : MGRS " + ice.join("");
    }
    catch(ex) {
        MARCONI.stdlib.log("Error formatting location: " + ex);
    }
}
function showMouseCoordinates(latLong) {
    try {
        updateStatusText(formatLocation(latLong));
        
    }
    catch(ex) {
        MARCONI.stdlib.log("Error showing mouse coordinates: " + ex);
    }
}
function initGrid() {
    var gridName = MARCONI.stdlib.listboxSelectedValue("cbGraticule");
    if( m_graticule ) {
        m_graticule.remove();
        m_graticule=null;
    }
    if( gridName ) {
        switch(gridName.toUpperCase()) {
            case "USNG":
                m_graticule = new USNG.Graticule(m_map);
                break;
                
                
        }
    }
    
}
OpenLayers.Control.Click = OpenLayers.Class(
    OpenLayers.Control, {

    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0,
        'stopSingle': false,
        'stopDouble': false
    },

    initialize: function(options) {
        this.handlerOptions = OpenLayers.Util.extend(
            {}, this.defaultHandlerOptions
        );
        OpenLayers.Control.prototype.initialize.apply(
            this, arguments
        );
        this.handler = new OpenLayers.Handler.Click(
            this, {
                'click': this.trigger
            }, this.handlerOptions
        );
    },

    trigger: function(evt) {
        var pt = m_map.getLonLatFromViewPortPx(evt.xy);

        // convert from spherical mercator to latlong
        
        var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);

        pt.transform(m_map.getProjectionObject(), proj);


        // no need to call edit handler unless actually editing
        if( !m_ReadOnly && m_ItemToEdit ) {
            //MARCONI.stdlib.log("Got a click");

            beginOrContinueEditing(pt, {reason: "click"});
        }
        // otherwise, just show where the user clicked
        else {
            showClickCoordinates(pt);
        }
    }

});

function showClickCoordinates(latLong) {
    //display mouse coordinates
    var info = formatLocation(latLong);
    
    if( !window.m_popup ) {
        window.m_popup = new OpenLayers.Popup(null,
                   toMapCoords(latLong),
                   new OpenLayers.Size(200,100),
                   info,
                   true);
                   
        m_popup.setBackgroundColor("rgba(39, 135, 194, 0.75)");
        m_popup.autoSize=true;
        m_map.addPopup(m_popup);
    }
    else {
        m_popup.setContentHTML(info);
        m_popup.lonlat = toMapCoords(latLong);
        m_popup.updatePosition();
        m_popup.show();
    }
}

function editingLayer(createIfNeeded) {
    var layer=m_EditLayerID ? m_map.getLayer(m_EditLayerID):null;

    if( !layer && createIfNeeded !== false) {
        MARCONI.stdlib.log("Creating edit layer");

        // we want opaque external graphics and non-opaque internal graphics
        var layer_style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
        layer_style.fillOpacity = 0.2;
        layer_style.graphicOpacity = 1;
        layer_style.pointRadius = 12;
        layer_style.graphicHeight = 24;
        layer_style.graphicWidth = 24;


        layer = new OpenLayers.Layer.Vector("EditLayer",
            {
                styleMap: new OpenLayers.StyleMap({
                    "default": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                        fillColor: "red",
                        strokeColor: "gray",
                        graphicName: "square",
                        rotation: 0,
                        pointRadius: 8,
                        fillOpacity : 0.5,
                        graphicOpacity : 1
                    }, OpenLayers.Feature.Vector.style["default"])),
                    "select": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                        graphicName: "square",
                        rotation: 0,
                        pointRadius: 8
                    }, OpenLayers.Feature.Vector.style["select"])),
                    "poly" : new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                        fillColor: "red",
                        strokeColor: "red",
                        graphicName: "square",
                        rotation: 0,
                        pointRadius: 8,
                        fillOpacity : 0.3,
                        graphicOpacity : 1
                    }, OpenLayers.Feature.Vector.style["poly"]))
                })
            });
            
        m_EditLayerID=layer.id;

    }
    
    return layer;

}

function selectorLayer() {
    var layer = m_SelectorLayerID ? m_map.getLayer(m_SelectorLayerID) : null;

    if( !layer ) {
        MARCONI.stdlib.log("Creating selector layer, id was " + m_SelectorLayerID);

        // we want opaque external graphics and non-opaque internal graphics
        var layer_style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
        layer_style.fillOpacity = 0.2;
        layer_style.graphicOpacity = 1;
        layer_style.pointRadius = 12;
        layer_style.graphicHeight = 24;
        layer_style.graphicWidth = 24;


        layer = new OpenLayers.Layer.Vector("SelectorDataLayer",
            {
                styleMap: new OpenLayers.StyleMap({
                    "default": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                        fillColor: "blue",
                        strokeColor: "gray",
                        graphicName: "circle",
                        rotation: 0,
                        pointRadius: 8,
                        fillOpacity : 0.5,
                        graphicOpacity : 1
                    }, OpenLayers.Feature.Vector.style["default"])),
                    "select": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                        graphicName: "circle",
                        fillColor: "red",
                        rotation: 0,
                        pointRadius: 8
                    }, OpenLayers.Feature.Vector.style["select"])),
                    "poly" : new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                        fillColor: "red",
                        strokeColor: "red",
                        graphicName: "square",
                        rotation: 0,
                        pointRadius: 8,
                        fillOpacity : 0.3,
                        graphicOpacity : 1
                    }, OpenLayers.Feature.Vector.style["poly"]))
                })
            });

            MARCONI.stdlib.log("Adding selector layer");

        m_map.addLayer(layer);

        function onFeatureUnselect(feature) {
            if( feature && feature.popup ) {
                m_map.removePopup(feature.popup);
                feature.popup.destroy();
                feature.popup = null;
            }
        }

        function getFeatureData(feature) {
            if( feature && feature.attributes ) {
                var str="<div>Geocode result detail<br>";
                for( var key in feature.attributes ) {
                    str += key +": " + feature.attributes[key] + "<br>";
                }
                return str + "</div>"
            }
            return feature ? feature.id : "";
        }
        layer.events.on( {
                'featureselected': function(evt) {
                    function onPopupClose(feature) {
                        onFeatureUnselect(feature);
                    }

                    //alert("selector layer selected");

                    if( evt && evt.feature ) {

                        var latLong = evt.feature.geometry.getBounds().getCenterLonLat();

                        
                        if( m_ItemToEdit == "POINT" && !m_ReadOnly) {
                        
                            //alert(latLong.toString());

                            var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);
                            // transform to basic lat-long
                            latLong.transform(m_map.getProjectionObject(), proj );

                            beginOrContinueEditing(latLong);

                        }
                        else {
                            MARCONI.stdlib.log("opening info popup");
                            
                            //alert("popup at " + latLong.toString());

                            var popup = new OpenLayers.Popup.FramedCloud(evt.feature.id,
                                         evt.feature.geometry.getBounds().getCenterLonLat(),
                                         null,  // default size
                                         getFeatureData(evt.feature),
                                         null,
                                         true,          // show close button
                                         function(){onPopupClose(evt.feature)}  // called on close
                                     );
                            evt.feature.popup = popup;

                            m_map.addPopup(popup);
                        }

                     }
                     else {
                         alert("Missing feature data");
                     }
                 },
                 'featureunselected' : function(evt) {
                     if( evt && evt.feature ) {
                        onFeatureUnselect(evt.feature);
                     }
                 }
            });




    }

    m_SelectorLayerID=layer.id;

    return layer;
}
function getPolyPoints(geometry) {
    try {

        // read geometry, return an array of points each of which has two properties: latitude and longitude

        if(!geometry) {
            return null;
        }

        // read the geometry from the object so we can compute properties and-or post back to our opening window
        var pts=[];
        var mapPoint;
        var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);
        

        if(!geometry.getVertices()) {
            throw "Cannot read points from polygon/polyline since no point collection found";
        }
        var vertices = geometry.getVertices();

        for( var i =0 ; i < vertices.length ; i++) {
            mapPoint = vertices[i].clone();
            // transform to basic lat-long
            mapPoint.transform(m_map.getProjectionObject(), proj );

            pts.push({latitude: mapPoint.y, longitude: mapPoint.x});
        }
        return pts;
    }
    catch(ex) {
        throw "Unable to read poly points: " + ex;
    }
}
function fitViewAroundGeometry(geo, refitEvenIfGeoVisible) {
    try {
        // resize only if told to do so unconditionally, or if geometry of interest is not visible
        
        var isPoint = (!geo.getBounds);
        
        var mapExtent = m_map.getExtent();
        
        
        var doResize = refitEvenIfGeoVisible || (isPoint && !mapExtent.containsLonLat(geo) || !m_map.getExtent().containsBounds(geo.getBounds()) );

        if( doResize ) {
            if( isPoint ) {
                m_map.setCenter(geo);
            }
            else {
                // center map about centroid of geometry so that map is 3x size of geometry
                var newMapExtent = geo.getBounds().clone().toGeometry();

                var origin = newMapExtent.getCentroid();

                if( origin ) {
                    newMapExtent = newMapExtent.resize(3, origin);
                    m_map.zoomToExtent(newMapExtent.getBounds());
                }
                else {

                    var ctr = geo.getVertices()[0];

                    var latLon = new OpenLayers.LonLat(ctr.x, ctr.y);
                    m_map.setCenter(latLon);
                }    
            }
        }

    }
    catch(ex) {
        MARCONI.stdlib.log("Error fitting view around geometry: " + ex);
    }
}
function beginOrContinueEditing(latLong, flags) {
    function beginOrContinuePointEditing(latLong, flags) {
        function updateMetricsDisplay(latLong) {
            try {
                
                if(!m_ReadOnly) {
                    genericMapReportPoint(latLong.lat, latLong.lon);
                }

                var usng = USNG.LLtoUSNG(latLong.lat, latLong.lon);

                var infoDiv = document.getElementById("infoDiv");

                if( infoDiv ) {

                    infoDiv.innerHTML =
                        "Point location: " + fixedLlString(latLong.lat, latLong.lon) + " (WGS84)    " + usng;
                }
            }
            catch(ex) {
                MARCONI.stdlib.log("error updating point metrics: " + ex);
            }
        }

        MARCONI.stdlib.log("Begin or continue point editing" + (latLong ? " with point of " + latLong.toString() : ""));

        
        var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);

        if( flags && flags.initialDraw ) {
            // get point which may have been passed via command line

            latLong = genericMapInitialLatLong();  

        }
        // check for completion of simple drag
        else if( flags && flags.isDragComplete && m_GeometryObject ) {
            MARCONI.stdlib.log("Handling drag");
            
            latLong = new OpenLayers.LonLat(m_GeometryObject.geometry.x, m_GeometryObject.geometry.y);

            // transform to basic lat-long
            latLong.transform(m_map.getProjectionObject(), proj );

            updateMetricsDisplay(latLong);
        
            return;
        }
        

        if( !latLong ) {
            MARCONI.stdlib.log("Nothing to do when editing point ...");
            return;
        }

        updateMetricsDisplay(latLong);
        
        // transform latLong to map coord system
        
        //MARCONI.stdlib.log("latlong starting as " + latLong.toString());
        
        latLong = latLong.transform(proj, m_map.getProjectionObject());

        //MARCONI.stdlib.log("latlong transformed to " + latLong.toString());
        

        var layer = editingLayer();

        if(!m_GeometryObject) {
            var geometry = new OpenLayers.Geometry.Point(latLong.lon, latLong.lat);

            m_GeometryObject = new OpenLayers.Feature.Vector(geometry);
            
            layer.addFeatures([m_GeometryObject]);

            MARCONI.stdlib.log("New pt x,y=" + latLong.lon + ", " + latLong.lat + ", " + m_map.getProjectionObject().toString());

        }
        else {
            m_GeometryObject.geometry.x = latLong.lon;
            m_GeometryObject.geometry.y = latLong.lat;

            MARCONI.stdlib.log("Adjusted existing point location to x,y=" + latLong.lon + ", " + latLong.lat);
        
            MARCONI.stdlib.log("" + m_GeometryObject.geometry.x + ", " + m_GeometryObject.geometry.y);
        }

        layer.redraw();  // draw point in new location

        // this works because latLong now holds map units not geographic units
        if(!m_map.getExtent().containsLonLat(latLong)) {
            m_map.setCenter(geo);
        }
    }

    function beginOrContinueCircleEditing(latLong, flags) {
        function updateCircle(flags) {
            function getNewRadius(centerPoint, vertices) {
                
                var radiusMinor=0;
                var radiusMajor=0;
                var radiusAverage=0.0;
                var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);

                for( var i = 0 ; i < vertices.length ; i++) {
                    var pt = vertices[i].clone();
                    pt.transform(m_map.getProjectionObject(), proj );  // to latlong

                    var dist = metersBetween(pt, centerPoint);
                    
                    if( i === 0 ) {
                        radiusMinor=dist;
                        radiusMajor=dist;
                    }
                    else if( dist < radiusMinor  ) {
                        radiusMinor=dist;
                    }
                    else if( dist > radiusMajor  ) {
                        radiusMajor=dist;
                    }

                    radiusAverage += dist;
                }

                radiusAverage = radiusAverage / vertices.length;

                MARCONI.stdlib.log("Radii are" + radiusMinor + ", " + radiusAverage + ", " + radiusMajor);

                // return the radius that is most unlike the average, as that is the one the user's trying to set 
                return radiusMajor - radiusAverage < radiusAverage - radiusMinor  ? radiusMinor : radiusMajor;
            }

            try {
                var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);
                var mapGeo = m_GeometryObject.geometry;
                var centerPoint = mapGeo.getCentroid(); 
                
                
                var circumPoint = mapGeo.getVertices()[0].clone();
                
                centerPoint.transform(m_map.getProjectionObject(), proj );  // from map units to latlong

                // if circumferential point is not in degrees, convert to degrees
                if( Math.abs(circumPoint.x) > 361  ) {
                    circumPoint.transform(m_map.getProjectionObject(), proj );  
                }
                else {
                    MARCONI.stdlib.log("skipping transform since point is " + circumPoint.toString());
                }
                
                var actualRadiusMeters = metersBetween(centerPoint, circumPoint);

                // only mess with circle if not readonly
                if(!m_ReadOnly) {

                    //MARCONI.stdlib.log("Center at " + centerPoint.toString() + ", circumPoint is " + circumPoint.toString() + " of " + vertexCount + " with radius of " + actualRadiusMeters);

                    var defaultRadius       = parseFloat(document.getElementById("Radius").value);
                    var linearUnitCD = MARCONI.stdlib.listboxSelectedValue("cbLinearUnits")|| m_DistanceUnits;

                    if( document.getElementById("chkForceDefaultSize").checked && defaultRadius  ) {
                        var requiredRadiusMeters = MARCONI.map.toMeters(defaultRadius, linearUnitCD);

                        if( Math.abs(actualRadiusMeters - requiredRadiusMeters) > 0.1 ) {
                            MARCONI.stdlib.log("About to adjust radius from " + actualRadiusMeters + " to " + requiredRadiusMeters + " meters");
                            var ctrLatLong = new OpenLayers.LonLat(centerPoint.x, centerPoint.y);

                            var newCircumPoint = getPointOffset(ctrLatLong, defaultRadius, 0, linearUnitCD);
                            circumPoint.x = newCircumPoint.lon;
                            circumPoint.y = newCircumPoint.lat;

                            m_editingLayer.destroyFeatures([m_GeometryObject]);

                            m_GeometryObject = drawCircle(centerPoint, requiredRadiusMeters, false);

                            //MARCONI.stdlib.log("Updating circle geometry");

                            editingLayer().addFeatures([m_GeometryObject]);

                        }
                    }
                    else if( flags && flags.userEdit ) {
                        //MARCONI.stdlib.log("User edit completed");
                        // Assume user may have pulled a vertex to a new radius

                        var newRadiusMeters = getNewRadius(centerPoint, mapGeo.getVertices());
                        
                        var radius = MARCONI.stdlib.fixedFormatNumber(
                            MARCONI.map.fromMeters(newRadiusMeters, linearUnitCD),1,2,true);
                        
                        document.getElementById("Radius").value = radius;
                        genericMapReportRadiusUpdate(document.getElementById("Radius").value);
                    

                        m_editingLayer.destroyFeatures([m_GeometryObject]);

                        m_GeometryObject = drawCircle(centerPoint, newRadiusMeters, false);

                        MARCONI.stdlib.log("Recreated circle geometry");

                        editingLayer().addFeatures([m_GeometryObject]);
                    }
                    else {
                        MARCONI.stdlib.log("Radius = " + actualRadiusMeters );
                    }

                    // post back to caller to ensure caller knows latest geometry
                    var pts=[];
                    pts.push( {latitude: centerPoint.y,  longitude: centerPoint.x} );
                    pts.push( {latitude: circumPoint.y, longitude: circumPoint.x} );
                    genericMapReportGeometryUpdate(m_ItemToEdit,pts);
                }

                return actualRadiusMeters;
            }
            catch(ex) {
                MARCONI.stdlib.log("Error updating circle geometry: " + ex);
            }
        }

        function updateMetricsDisplay(radiusMeters) {
            try {
                var arealUnitCD   = MARCONI.stdlib.listboxSelectedValue("cbArealUnits")   || m_ArealUnits;
                var linearUnitCD  = MARCONI.stdlib.listboxSelectedValue("cbLinearUnits")  || m_DistanceUnits;

                var infoDiv = document.getElementById("infoDiv");

                if( infoDiv ) {

                    var perimeter = Math.PI * radiusMeters * 2.0;
                    var area = Math.PI * radiusMeters * radiusMeters;  // in square meters
                    var radius = MARCONI.stdlib.fixedFormatNumber(MARCONI.map.fromMeters(radiusMeters, linearUnitCD),1,2,true);
                    
                    if( !document.getElementById("chkForceDefaultSize").checked && radius != document.getElementById("Radius").value ) {
                        document.getElementById("Radius").value = radius;
                        genericMapReportRadiusUpdate(radius);
                    } 
                    
                    infoDiv.innerHTML =
                        "Perimeter=" + MARCONI.stdlib.fixedFormatNumber(
                            MARCONI.map.unitsConversion(perimeter, MARCONI.map.UNITS_METERS, linearUnitCD),1, 2, true) + " " + linearUnitCD + ", Area=" +
                        MARCONI.stdlib.fixedFormatNumber(
                            MARCONI.map.unitsConversion(area, MARCONI.map.UNITS_SQUAREMETERS, arealUnitCD), 1, 2, true) + " " + arealUnitCD;
                }
                else {
                    MARCONI.stdlib.log("skipping update since units are " + arealUnitCD + " and info div is " + infoDiv);
                }


            }
            catch(ex) {
                MARCONI.stdlib.log("error updating circle metrics: " + ex);
            }

        }

        var radiusMeters;
        var forceSize = document.getElementById("chkForceDefaultSize").checked;
        var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);


        if( m_GeometryObject ) {
            MARCONI.stdlib.log("circle exists");

            radiusMeters = updateCircle(flags);  // adjusts geometry based on changes in locks or user keyin, if needed
        }
        else {
            // make new circle, start by making center point in lat-long
            
            var centerPoint = latLong || toLonLat(m_map.getCenter());
            if( latLong ) {
                MARCONI.stdlib.log("Circle centered on given lat-long");
            }
            else {
                MARCONI.stdlib.log("Circle centered in map bounds");
            }

            // read coordinates of circumferential point, we will use to calculate radius
            var circumPoint = null;
            var circumLat  = MARCONI.stdlib.paramValue("CircumLatitude");
            var circumLong = MARCONI.stdlib.paramValue("CircumLongitude");
            
            // note we check for null, i.e. missing params, so zero values don't fool us
            if( forceSize || circumLat===null || circumLong===null ) {
                var defaultRadius       = parseFloat(document.getElementById("Radius").value) || m_DefaultRadius;
                var linearUnitCD        = MARCONI.stdlib.listboxSelectedValue("cbLinearUnits")|| m_DistanceUnits;
                circumPoint = getPointOffset(centerPoint, defaultRadius, 0, linearUnitCD);
            }
            else {
                circumPoint = new OpenLayers.LonLat(circumLong, circumLat);
            }
            
            radiusMeters = metersBetween(centerPoint, circumPoint);

            MARCONI.stdlib.log("Drawing new circle with center " + centerPoint.toString() + " and radius " + radiusMeters + " meters");

            m_GeometryObject = drawCircle(centerPoint, radiusMeters, false);

            if(!m_GeometryObject) {
                throw "Cannot create circle";
            }

            var layer = editingLayer();
            
            layer.addFeatures([m_GeometryObject]);
        }

        // if not a user stretch
        
        MARCONI.stdlib.log("Refitting map to fit circle comfortably");

        fitViewAroundGeometry(m_GeometryObject.geometry, flags && flags.initialDraw);

        updateMetricsDisplay(radiusMeters);
    }

    function getPointOffset(pt, offsetX, offsetY, linearUnitCD) {
        try {
            // given a LonLat point, and offset in linear units, return a new LonLat at offset
            var newPt = new OpenLayers.LonLat(pt.lon, pt.lat + 1);

            var degreesPerMeterY = 1/Math.abs(metersBetween(pt, newPt));

            newPt = new OpenLayers.LonLat(pt.lon + 1, pt.lat);

            var degreesPerMeterX = 1/Math.abs(metersBetween(pt, newPt));

            var deltaLatitude  = MARCONI.map.toMeters(offsetY, linearUnitCD) * degreesPerMeterY;

            var deltaLongitude = MARCONI.map.toMeters(offsetX, linearUnitCD) * degreesPerMeterX;

            newPt= new OpenLayers.LonLat(pt.lon + deltaLongitude, pt.lat + deltaLatitude);

            return newPt;
        }
        catch(err) {
            alert("Error getting point offset from pt " + pt + ", error is: " + err);
        }

    }
    
    function beginOrContinueRectangleEditing(latLong, flags) {
        function updateRectangle(flags) {
            try {
                var didGeometryChange = flags && flags.whatChanged ? true : false;

                var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);

                // get bounds in map units
                var mapGeo = m_GeometryObject.geometry.getBounds().clone();


                // see if user provided a required width and height
                var defaultWidth  = document.getElementById("Width").value || m_DefaultExtentsWidth;
                var defaultHeight = document.getElementById("Height").value || m_DefaultExtentsHeight;
                var linearUnitCD  = MARCONI.stdlib.listboxSelectedValue("cbLinearUnits")  || m_DistanceUnits;

                var latLongGeo = mapGeo.clone();
                latLongGeo.transform(m_map.getProjectionObject(), proj );  // from map units to latlong
                
                var widthMeters  = metersBetween(
                        new OpenLayers.LonLat(latLongGeo.left,  (latLongGeo.bottom+latLongGeo.top)*0.5) ,
                        new OpenLayers.LonLat(latLongGeo.right, (latLongGeo.bottom+latLongGeo.top)*0.5) );

                var heightMeters  = metersBetween(
                    new OpenLayers.LonLat((latLongGeo.left+latLongGeo.right)*0.5, latLongGeo.bottom),
                    new OpenLayers.LonLat((latLongGeo.left+latLongGeo.right)*0.5, latLongGeo.top));
                    
                var width = MARCONI.map.fromMeters(widthMeters, linearUnitCD);
                var height = MARCONI.map.fromMeters(heightMeters, linearUnitCD);


                if( document.getElementById("chkForceDefaultSize").checked ) {

                    MARCONI.stdlib.log("Checking if rectangle matches required size");

                    var requiredWidthMeters  = MARCONI.map.toMeters(parseFloat(defaultWidth),  linearUnitCD );
                    var requiredHeightMeters = MARCONI.map.toMeters(parseFloat(defaultHeight), linearUnitCD );

                    width = defaultWidth;
                    height = defaultHeight;
                    
                    var EPSILON=0.1;

                    if( Math.abs(width-requiredWidthMeters) > EPSILON || Math.abs(height-requiredHeightMeters) > EPSILON ) {

                        didGeometryChange = true;

                        MARCONI.stdlib.log("Adjusting rectangle as needed to match prescribed size");

                        var ctr = latLongGeo.getCenterLonLat();

                        var lowerLeft  = getPointOffset(ctr, -requiredWidthMeters/2, -requiredHeightMeters/2, "m");
                        var upperRight = getPointOffset(ctr, requiredWidthMeters/2, requiredHeightMeters/2, "m");

                        latLongGeo = new OpenLayers.Bounds(
                            lowerLeft.lon,
                            lowerLeft.lat,
                            upperRight.lon,
                            upperRight.lat );
                            
                        mapGeo = latLongGeo.clone();

                        mapGeo.transform( proj, m_map.getProjectionObject());  // from latlong to map units

                    }
                    else {
                        MARCONI.stdlib.log("Width and height match required sizes of " + width + ", " + height);

                    }
                }
                else {
                    didGeometryChange = 
                        document.getElementById("Width").value != width ||
                        document.getElementById("Height").value != height;
                    
                    document.getElementById("Width").value  = width;
                    document.getElementById("Height").value = height;
                }

                pts.push({latitude: latLongGeo.bottom, longitude: latLongGeo.left});
                pts.push({latitude: latLongGeo.top, longitude: latLongGeo.right});


                // geometry changed (or may have changed), so rebuild it

                var style=m_GeometryObject.style;

                m_editingLayer.destroyFeatures([m_GeometryObject]);

                m_GeometryObject = new OpenLayers.Feature.Vector(mapGeo.toGeometry(), null, style);

                MARCONI.stdlib.log("Updated rectangle geometry");

                editingLayer().addFeatures([m_GeometryObject]);
                
                if( didGeometryChange ) {
                    genericMapReportWidthUpdate(width);
                    genericMapReportHeightUpdate(height);
                }

                // return value tells caller they may want to report changed geometry
                return didGeometryChange || (flags && flags.userEdit);
            }
            catch(ex) {
                MARCONI.stdlib.log("Error updating rectangle: " + ex);
            }
        }
        
        function updateMetricsDisplay() {
            try {
                var linearUnitCD  = MARCONI.stdlib.listboxSelectedValue("cbLinearUnits")  || m_DistanceUnits;
                var arealUnitCD   = MARCONI.stdlib.listboxSelectedValue("cbArealUnits")   || m_ArealUnits;

                var infoDiv = document.getElementById("infoDiv");

                if( infoDiv && arealUnitCD ) {
                    var ptList=[];

                    // get geometry in map units, convert to lat-long
                    var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);
                    var mapGeo = m_GeometryObject.geometry.getBounds();
                    var latLongGeo = mapGeo.clone();
                    latLongGeo.transform(m_map.getProjectionObject(), proj );  // from map units to latlong

                    // go around rectange from lower-left corner in counter-clockwise manner and close on the origin
                    ptList.push(new MARCONI.map.GeoPoint( latLongGeo.left,  latLongGeo.bottom ));
                    ptList.push(new MARCONI.map.GeoPoint( latLongGeo.right, latLongGeo.bottom));
                    ptList.push(new MARCONI.map.GeoPoint( latLongGeo.right, latLongGeo.top));
                    ptList.push(new MARCONI.map.GeoPoint( latLongGeo.left,  latLongGeo.top));
                    ptList.push(new MARCONI.map.GeoPoint( latLongGeo.left,  latLongGeo.bottom));

                    var widthMeters  = MARCONI.map.metersBetween(ptList[0], ptList[1]);
                    var heightMeters = MARCONI.map.metersBetween(ptList[1], ptList[2]);

                    //MARCONI.stdlib.log("Measured meters=" + widthMeters + " by " + heightMeters + ", aerial units are " + arealUnitCD);

                    var perimeter = MARCONI.map.polygonPerimeter(ptList);  // in meters

                    var area = MARCONI.map.polygonArea(ptList);  // in square meters

                    infoDiv.innerHTML =
                        MARCONI.stdlib.fixedFormatNumber(
                                MARCONI.map.fromMeters(widthMeters,  linearUnitCD),1, 2, true) + " by " +
                                MARCONI.stdlib.fixedFormatNumber(
                            MARCONI.map.fromMeters(heightMeters, linearUnitCD),1, 2, true) + " " + linearUnitCD + ", Perimeter=" +
                        MARCONI.stdlib.fixedFormatNumber(
                            MARCONI.map.fromMeters(perimeter,    linearUnitCD),1, 2, true) + " " + linearUnitCD + ", Area=" +
                        MARCONI.stdlib.fixedFormatNumber(
                            MARCONI.map.unitsConversion(area,         MARCONI.map.UNITS_SQUAREMETERS, arealUnitCD), 1, 2, true) + " " + arealUnitCD ;
                }
                else {
                    MARCONI.stdlib.log("skipping update since units are " + arealUnitCD + " and info div is " + infoDiv);
                }


            }
            catch(ex) {
                MARCONI.stdlib.log("error updating rectangle metrics: " + ex);
            }

        }


        try {
            var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);

            // calculate defaults
            // it's possible first call occurs before the various controls are initialized, so tolerate that
            var width  = document.getElementById("Width").value || m_DefaultExtentsWidth;
            var height = document.getElementById("Height").value || m_DefaultExtentsHeight;
            var linearUnitCD  = MARCONI.stdlib.listboxSelectedValue("cbLinearUnits")  || m_DistanceUnits;
            var forceSize     = document.getElementById("chkForceDefaultSize").checked;
            

            if( !m_GeometryObject ) {
                var geo;

                var latMin        = MARCONI.stdlib.paramValue("LatitudeMin");
                var latMax        = MARCONI.stdlib.paramValue("LatitudeMax");
                var longMin       = MARCONI.stdlib.paramValue("LongitudeMin");
                var longMax       = MARCONI.stdlib.paramValue("LongitudeMax");

                if( forceSize || !latMin || !longMin || !longMin || !longMax ) {
                    var ctr=latLong || toLonLat(m_map.getCenter());
                    
                    if( latLong ) {
                        MARCONI.stdlib.log("Extents centered on given lat-long");
                    }
                    else {
                        MARCONI.stdlib.log("Extents centered in map bounds");
                    }
                    
                    ctr.transform(m_map.getProjectionObject(), proj );
                        
                    var lowerLeft  = getPointOffset(ctr, -width/2, -height/2, linearUnitCD);
                    var upperRight = getPointOffset(ctr,  width/2,  height/2, linearUnitCD);

                    geo = new OpenLayers.Bounds(
                            lowerLeft.lon,
                            lowerLeft.lat,
                            upperRight.lon,
                            upperRight.lat ).toGeometry();


                }
                else {

                    geo = new OpenLayers.Bounds(longMin,latMin,longMax,latMax).toGeometry();

                    MARCONI.stdlib.log("Extent bounds provided explicitly");
                }

                // transform from basic lat-long to map projection
                geo.transform(proj, m_map.getProjectionObject());

                var style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
                style.fillOpacity = 0.2;
                style.graphicOpacity = 1;
                style.pointRadius = 12;
                style.graphicHeight = 24;
                style.graphicWidth = 24;
                style.fillColor= "blue";
                style.strokeColor="blue";
                style.strokeWidth = 3;
                style.rotation= 0;
                style.pointRadius=4;

                m_GeometryObject = new OpenLayers.Feature.Vector(geo, null, style);

                m_editingLayer.addFeatures([m_GeometryObject]);

                fitViewAroundGeometry(m_GeometryObject.geometry, true);
            }
            else if( !m_ReadOnly ) {
                MARCONI.stdlib.log("Rectangle exists " + MARCONI.stdlib.logObject(m_GeometryObject.geometry));

                var pts=[];  // will be filled with two points, each with latitude and longitude properties

                // adjust as needed to account for any changes in user criteria, e.g. keyed-in width
                if( updateRectangle(pts, flags) ) {
                    if( pts ) {
                        MARCONI.stdlib.log("Rectangle changed, posting to opener");
                        genericMapReportGeometryUpdate("EXTENTS", pts);
                        
                        
                    }
                }
                fitViewAroundGeometry(m_GeometryObject.geometry);
                
            }

            updateMetricsDisplay();
            
        }
        catch(ex) {
            alert("Error initializing rectangle editing: " + ex);
        }

    }

    function beginOrContinuePolyEditing() {

        function updateMetricsDisplay(pts) {
            try {
                var linearUnits  = MARCONI.stdlib.listboxSelectedValue("cbLinearUnits")  || m_DistanceUnits;
                if( !pts ) {
                    pts = getPolyPoints(m_GeometryObject.geometry);
                }

                var infoDiv = document.getElementById("infoDiv");

                if( infoDiv  ) {
                    var geoPtList = [];

                    for( var i = 0 ; i < pts.length ; i++) {
                        geoPtList.push(new MARCONI.map.GeoPoint(pts[i].longitude, pts[i].latitude));
                    }

                    if( m_ItemToEdit == "POLYGON" ) {
                        var arealUnits   = MARCONI.stdlib.listboxSelectedValue("cbArealUnits")  ||  m_ArealUnits;
                        
                        if( arealUnits ) {
                            // close path if needed
                            if( pts[pts.length-1].latitude  != pts[0].latitude ||
                                pts[pts.length-1].longitude != pts[0].longitude ) {

                                geoPtList.push(new MARCONI.map.GeoPoint(pts[0].longitude, pts[0].latitude));

                            }
                            var perimeter = MARCONI.map.polygonPerimeter(geoPtList);

                            var area = MARCONI.map.polygonArea(geoPtList);

                            infoDiv.innerHTML = "Perimeter = " +
                                MARCONI.stdlib.fixedFormatNumber(
                                MARCONI.map.unitsConversion(perimeter, MARCONI.map.UNITS_METERS, linearUnits), 1, 4) + " " + linearUnits + ", Area = " +
                                MARCONI.stdlib.fixedFormatNumber(
                                MARCONI.map.unitsConversion(area, MARCONI.map.UNITS_SQUAREMETERS, arealUnits), 1, 4) + " " + arealUnits;
                        }
                    }
                    else {
                        // LINE
                        var length = MARCONI.map.polygonPerimeter(geoPtList);

                        infoDiv.innerHTML = "Length = " +
                                MARCONI.stdlib.fixedFormatNumber(
                                MARCONI.map.unitsConversion(length, MARCONI.map.UNITS_METERS, linearUnits), 1, 4) + " " + linearUnits;

                    }
                        }
            }
            catch(ex) {
                MARCONI.stdlib.log("Error updating poly metrics:" + ex);
            }
        }

        function updatePoly(pts) {
            try {
                // read geometry, post collection of points back to caller

                if( pts ) {
                    pts=getPolyPoints(m_GeometryObject.geometry);
                }

                updateMetricsDisplay(pts);

                genericMapReportGeometryUpdate(m_ItemToEdit, pts);

            }
            catch(ex) {
                MARCONI.stdlib.log("Error reading poly updates: " + ex);
            }
        }

        try {
            if( m_GeometryObject ) {
                var pts = getPolyPoints(m_GeometryObject.geometry);
                updateMetricsDisplay(pts);
                if( !m_ReadOnly ) {
                    updatePoly(pts)
                }
                return;
            }
            else {
                
                var pointStringCtlName = MARCONI.stdlib.paramValue("PointStringSource");
                var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);

                if( !pointStringCtlName )
                    throw "Must provide parameter PointStringSource when working with polygons or lines";

                var pointStringCtl = opener.document.getElementById(pointStringCtlName);

                if( !pointStringCtl )
                    throw "Cannot find point string control " + pointStringCtlName;



                var pointList = pointStringCtl.value.split("|");
                
                // if not at least min points, make new geometry

                var geo;

                if( !pointList.length || (pointList.length < 2  || m_ItemToEdit=="POLYGON" && pointList.length < 3) || !pointList[0] ) {
                    geo = m_map.getExtent().clone().toGeometry().components[0];
                    geo=geo.resize(0.5, geo.getVertices()[0]);

                    if( m_ItemToEdit=="POLYGON" ) {
                        MARCONI.stdlib.log("Initializing polygon...");


                    }
                    else {
                        MARCONI.stdlib.log("Initializing polyline...");
                        //geo = m_map.getExtent().clone().toGeometry().components[0];
                        //geo = m_map.getExtent().clone().toGeometry();

                        geo = new OpenLayers.Geometry.LineString([geo.getVertices()[0].clone(), geo.getVertices()[2].clone()]);
                    
                        MARCONI.stdlib.log(geo.toString());
                    }
                }
                else {
                    MARCONI.stdlib.log("Initializing poly from point string of " + pointList.length + " items");
                    var mapPoints=[];

                    for( var i = 0 ; i < pointList.length ; i++) {
                        var nums=pointList[i].split("_");

                        if( nums.length == 2 ) {
                            var pt = new OpenLayers.Geometry.Point(parseFloat(nums[1]), parseFloat(nums[0]));
                            pt.transform(proj, m_map.getProjectionObject());  // from latlong to map units

                            mapPoints.push(pt);
                        }
                        else {
                            throw("Cannot parse string " + MARCONI.stdlib.logObject(pointList[i]) + " as a lat-long pair");
                        }
                    }

                    
                    // autoclose polygon if needed, as it might be if converting a line to a shape
                    if( m_ItemToEdit=="POLYGON" ) {
                        geo = new OpenLayers.Geometry.LinearRing(mapPoints);
                    }
                    else {
                        geo = new OpenLayers.Geometry.LineString(mapPoints);
                    }
                    MARCONI.stdlib.log("Done initializing " + m_ItemToEdit + " from point string");
                }


                // we want opaque external graphics and non-opaque internal graphics
                var style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
                style.fillOpacity = 0.2;
                style.graphicOpacity = 1;
                style.pointRadius = 12;
                style.graphicHeight = 24;
                style.graphicWidth = 24;
                style.fillColor= "red";
                style.strokeColor="blue";
                style.strokeWidth = 3;
                style.rotation= 0;
                style.pointRadius=4;

                m_GeometryObject = new OpenLayers.Feature.Vector(geo, null, style);

                stage="drawing geometry";

                var layer = editingLayer();

                layer.addFeatures([m_GeometryObject]);

                fitViewAroundGeometry(m_GeometryObject.geometry, true);

                updateMetricsDisplay();
            }
        }
        catch(ex) {
            throw "Error initializing polygon/line editing: " + ex;
        }
    }

    // setup edit layer if needed

    
    flags = flags || {};
    
    var initialDraw = flags.initialDraw || !m_EditingStarted;
    
    flags.initialDraw = initialDraw;
    
    MARCONI.stdlib.log("Initialdraw is " + initialDraw + ", initial latlong is " + (latLong ? latLong.toString() : "") + 
        (flags.reason ? ", reason=" + flags.reason : "") );
    
    if( !m_editingLayer ) {

        m_editingLayer = editingLayer();

        MARCONI.stdlib.log("Adding edit layer");

        m_map.addLayer(m_editingLayer);


        if( !m_ReadOnly ) {
            

            m_editingLayer.events.on( {
                'beforefeaturemodified': function(event) {
                     return true;  // let it happen, count on our edit tool mode to forbid vertex moves when size is locked
                 },
                 'featuremodified': function(event) {
                    MARCONI.stdlib.log(event.type + (event.feature ? event.feature.id : event.components));
                 },
                'afterfeaturemodified': function(event) {
                    MARCONI.stdlib.log(event.type + (event.feature ? event.feature.id : event.components));
                    //alert("user edit done");
                    beginOrContinueEditing(null, {userEdit:true});
                 }
            });

            m_EditingControl = (m_ItemToEdit=="POINT" ?
                new OpenLayers.Control.DragFeature(m_editingLayer, {onComplete: function() {
                    beginOrContinuePointEditing(null, {isDragComplete:true});
                }}) :
                new OpenLayers.Control.ModifyFeature(m_editingLayer, {
                    mode: document.getElementById("chkForceDefaultSize").checked ? OpenLayers.Control.ModifyFeature.DRAG :
                        OpenLayers.Control.ModifyFeature.RESHAPE | OpenLayers.Control.ModifyFeature.DRAG
            }));

            m_map.addControl(m_EditingControl);

            m_EditingControl.activate();

            MARCONI.stdlib.log("Activated edit control");
        }
    }

    m_EditingStarted=true;
    
    MARCONI.stdlib.log("Switch for itemedit " + m_ItemToEdit);
    
    try {

        switch(m_ItemToEdit) {
            case "POINT":
                beginOrContinuePointEditing(latLong, flags);
                break;

            case "EXTENTS":
                beginOrContinueRectangleEditing(latLong, flags);
                break;

            case "CIRCLE":
                beginOrContinueCircleEditing(latLong, flags);
                break;

            case "LINE":
            case "POLYGON":
                beginOrContinuePolyEditing(latLong, flags);
                break;

            default:
                return;

        }
    }
    catch(ex) {
        alert("Error initializing edit: " + ex);
    }
}

function circleGeometry(centerPoint, radiusMeters, returnLatLongGeometry) {
    // returns linear ring describing a circle given centerPoint referenced to WGS84 Lat-long,
    // return points are in map units, unless returnLatLongGeometry is passed true

    //MARCONI.stdlib.log("Computing circular geometry from point " + centerPoint.toString() + " with radius " + radiusMeters);
    
    try {
        var pointCount=51;

        var circlePoints = [];

        var d = radiusMeters / MARCONI.map.RADIUS_WGS84_METERS;

        var lat1 = (Math.PI/180) * (centerPoint.y || centerPoint.lat); // radians
        var lng1 = (Math.PI/180) * (centerPoint.x || centerPoint.lon); // radians

        var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);

        //MARCONI.stdlib.log("center lat is " + lat1 + ", longitude= " + lng1);


        for (var a = 0 ; a < 361 ; a+=360/pointCount ) {
            var tc = (Math.PI/180)*a;

            var y = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(tc));

            var dlng = Math.atan2(Math.sin(tc)*Math.sin(d) * Math.cos(lat1), Math.cos(d)- Math.sin(lat1) * Math.sin(y));

            var x = ((lng1-dlng + Math.PI) % (2*Math.PI)) - Math.PI ; // MOD function


            x = x * (180/Math.PI);

            y = y * (180/Math.PI);
            
            var point = new OpenLayers.Geometry.Point(x, y);

            // convert points to map units unless told to return latlongs
            if(!returnLatLongGeometry) {

                point.transform(proj, m_map.getProjectionObject());  // from latlong to map units
            }

            circlePoints.push(point);


        }

        if( circlePoints[0].x != circlePoints[circlePoints.length-1].x ||
            circlePoints[0].y != circlePoints[circlePoints.length-1].y ) {
            circlePoints.push(circlePoints[0].clone());
            MARCONI.stdlib.log("Closed ring");
        }

        var theCircle = new OpenLayers.Geometry.LinearRing(circlePoints);

        return theCircle;
    }
    catch(ex) {
        throw "Error computing polygon approximating circle: " + ex;
    }
}
function drawCircle(centerPoint, radiusMeters, lineColor, lineWeight, lineOpacity){
    try {
        var theCircle = circleGeometry(centerPoint, radiusMeters);
        if( !theCircle ) {
            throw "Unable to create circular geometry";
        }

        // we want opaque external graphics and non-opaque internal graphics
        var style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);

        // to-do: use passed style values 

        style.fillOpacity = 0.2;
        style.graphicOpacity = 1;
        style.pointRadius = 12;
        style.graphicHeight = 24;
        style.graphicWidth = 24;
        style.fillColor= "red";
        style.strokeColor="blue";
        style.strokeWidth = 3;
        style.rotation= 0;
        style.pointRadius=4;

        var vectorFeature = new OpenLayers.Feature.Vector(theCircle, null, style);

        return  vectorFeature;  // not the graphic, the geometry, it's more useful
    }
    catch(ex) {
        throw "Error drawing circle given center " + MARCONI.stdlib.logObject(centerPoint) + " and radius " + radiusMeters + ": " + ex;
    }
}

function metersBetween(p1, p2) {
    // p1 and p2 are OpenLayers LatLon or OpenLayers Point objects in lat-long degrees
    try {
        if( p1.lon === undefined && p1.x === undefined ) {
            throw "Point 1 needs either lon or x property";
        }
        if( p1.lat === undefined && p1.y === undefined ) {
            throw "Point 1 needs either lat or y property";
        }
        if( p2.lon === undefined && p2.x === undefined ) {
            throw "Point 2 needs either lon or x property";
        }
        if( p2.lat === undefined && p2.y === undefined ) {
            throw "Point 2 needs either lat or y property";
        }

        var geo1 = p1.lon !== undefined && p1.lat !== undefined ?
            new MARCONI.map.GeoPoint(p1.lon, p1.lat) : new MARCONI.map.GeoPoint(p1.x, p1.y);

        var geo2 = p2.lon !== undefined && p2.lat !== undefined ?
            new MARCONI.map.GeoPoint(p2.lon, p2.lat) :
            new MARCONI.map.GeoPoint(p2.x, p2.y);

        var dist = MARCONI.map.metersBetween(geo1, geo2);

        return dist;
    }
    catch(ex) {

        throw("Error calculating meters between points: " + ex);
    }
}


function locate() {
    try {
        var address=document.getElementById("txtLocation").value;

        if( !address ) {
            return;
        }
        
        var isUSNG=MARCONI.map.isValidUSNG(address);
        var isUTM =MARCONI.map.isValidUTM(address);
        var latLong = null;

        if( isUSNG || isUTM ) {

            MARCONI.stdlib.log("Finding USNG or UTM location " + address);

            latLong = isUSNG ? USNG.USNGtoLL(address) : UTM_UTIL.UTMtoLL(address);
        }
        else {
            try {
                var pt = MARCONI.map.parseLatLong(address);
                if( pt ) {
                    MARCONI.stdlib.log("Parsed " + address + " as " + MARCONI.stdlib.logObject(pt));
                    latLong = new OpenLayers.LonLat(pt.x, pt.y);  
                }
            }
            catch(latLongErr) {
                MARCONI.stdlib.log("Could not parse " + address + " as lat-long");
            }
        }

        if( latLong ) {
            // if editing a point, simply adjust the point's location
            if( m_ItemToEdit == "POINT" && !m_ReadOnly ) {
                MARCONI.stdlib.log("Adjusting point to grid " + address + ", latLong " + latLong.toString());
                beginOrContinueEditing(latLong);
            }
            else {
                var usng = USNG.LLtoUSNG(latLong.lat, latLong.lon);
                var utm  = UTM_UTIL.LLtoUTM(latLong.lat, latLong.lon);

                // if not editing a point, show the point on the disposable dynamics layer for the user's info
                var geometry = new OpenLayers.Geometry.Point(latLong.lon, latLong.lat);
                var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);

                geometry.transform(proj, m_map.getProjectionObject());  // from latlong to map units

                var feature = new OpenLayers.Feature.Vector(geometry);

                feature.attributes = {usng: usng, utm: utm, latitude: latLong.lat, longitude: latLong.lon};

                selectorLayer().addFeatures([feature]);

                fitViewAroundGeometry(geometry);
            }

        }
        else {
            alert("Unable to parse entered value " + address + " as USNG, UTM or lat-long");
        }

        return;
    }
    catch(ex) {
        alert("Error performing locate: " + ex);
    }
}

