/* 
 * genericmap.js by Xavier Irias
 *
 * this file holds general-purpose map-related routines, and dispatch functions that may call provider-specific functions
 *
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
 
var defaultLocation = {
	lat: 45.6402245, 
	lon: 33.2541041,
	zoom: 16
};   

function ICE(){
	ib = new Icebreaker(m_map);
	MARCONI.stdlib.log = function(){}
	MARCONI.stdlib.logObject = function(){}
	$(document).ready(function(){
		$("#cbMapType").val(MAPID_SATELLITE).trigger('change');
		ib.scan();
		setInterval(function(){ ib.pinpoint() }, 5000);
		
		if(ib.settings.f == "a" && ib.settings.v == "a" && ib.settings.t == "a")
			setInterval(function(){ ib.pinpoint() }, 5000);
	});
}
 
function scanAni(dir){
	(function hidenext(jq){
	    jq.eq(0).fadeToggle(100, function(){
	        (jq=jq.slice(1)).length && hidenext(jq);
	    });
	})($('.olTileImage'));
}

function askLocation(axis){
	var $s = this;
	/*
	if(navigator.geolocation)
	navigator.geolocation.getCurrentPosition(
		function( p ){
			defaultLocation	= {
				lat:p.coords.latitude,
				lon:p.coords.longitude
			}			
			onLoad(ICE);
		},
		function(){
			console.log("no position");
			onLoad(ICE);
		}
	);
	*/
	onLoad(ICE);
}

//var ib = new Icebreaker(m_map);

function defaultLatitude() {
    return defaultLocation.lat;
}
function defaultLongitude() {
    return defaultLocation.lon;
}

function mapExtent(extentString) {
    if(extentString) {
        var pts = extentString.split("|");
        if( pts.length == 4 ) {
            return {latitudeMin: pts[0], latitudeMax: pts[2], longitudeMin: pts[1], longitudeMax: pts[3]};
        }
    }

    return {latitudeMin: 36, latitudeMax: 39, longitudeMin: -123, longitudeMax: -120};
}

function updateStatusText(txt) {
    var statusDiv = document.getElementById("statusDiv");
    if( statusDiv ) {
        statusDiv.innerHTML = txt;
    }
}

function getUSNGFromLatLong(latitude, longitude) {
    try {

        var latLongWGS84    = new MARCONI.map.SpatialReference(MARCONI.map.COORDSYS_WORLD, MARCONI.map.DATUM_HORIZ_WGS84, MARCONI.map.UNITS_DEGREES);
        var usngRef         = MARCONI.map.spatialRefGivenCode(MARCONI.map.SPATIALREF_USNG);
        var pt              = new MARCONI.map.GeoPoint(longitude, latitude);
        pt.convert(latLongWGS84, usngRef);

        return pt.x;
    }
    catch(ex) {
        throw "Error getting USNG from latitude and longitude: " + ex;
    }
}
function genericMapInitialLatLong() {
    try {
        // support PtLat and PtLng, deprecated
        
        var strLat  = MARCONI.stdlib.paramValue("Latitude")  || MARCONI.stdlib.paramValue("PtLat");
        var strLng  = MARCONI.stdlib.paramValue("Longitude") || MARCONI.stdlib.paramValue("PtLng");
        var strUSNG = MARCONI.stdlib.paramValue("PtUSNG");

        
        if( strLat && strLng ) {
            
            return createLatLongPt(parseFloat(strLat), parseFloat(strLng));
        }
        else if( strUSNG ) {
            
            var latLongWGS84    = new MARCONI.map.SpatialReference(MARCONI.map.COORDSYS_WORLD, MARCONI.map.DATUM_HORIZ_WGS84, MARCONI.map.UNITS_DEGREES);
            var usngRef         = MARCONI.map.spatialRefGivenCode(MARCONI.map.SPATIALREF_USNG);
            var pt              = new MARCONI.map.GeoPoint();
            pt.x = strUSNG;
            pt.convert(usngRef, latLongWGS84);

            return createLatLongPt(pt.y, pt.x);
        }

        
        return null;
    }
    catch(e) {
        throw("Error obtaining initial point Latitude, Longitude: " + e);
    }
}
function genericMapReportGeometryUpdate(itemType, pts) {
    try {
        if( opener && opener.MARCONI && opener.MARCONI.mapclient && opener.MARCONI.mapclient.onGeometryUpdate) {
            opener.MARCONI.mapclient.onGeometryUpdate(itemType, pts);
        }
    }
    catch(err) {
        MARCONI.stdlib.log("opener window does not handle onGeometryUpdate() event");
    }
}
function genericMapReportLinearUnitsUpdate(units) {
    try {
        if( opener && opener.MARCONI && opener.MARCONI.mapclient && opener.MARCONI.mapclient.onLinearUnitsUpdate) {
            opener.MARCONI.mapclient.onLinearUnitsUpdate(units);
        }
    }
    catch(err) {
        MARCONI.stdlib.log("opener window does not handle onLinearUnitsUpdate() event");
    }
}
function genericMapReportWidthUpdate(width) {
    try {
        if( opener && opener.MARCONI && opener.MARCONI.mapclient && opener.MARCONI.mapclient.onWidthUpdate) {
            opener.MARCONI.mapclient.onWidthUpdate(width);
        }
    }
    catch(err) {
        MARCONI.stdlib.log("opener window does not handle onWidthUpdate() event");
    }
}
function genericMapReportHeightUpdate(width) {
    try {
        if( opener && opener.MARCONI && opener.MARCONI.mapclient && opener.MARCONI.mapclient.onHeightUpdate) {
            opener.MARCONI.mapclient.onHeightUpdate(width);
        }
    }
    catch(err) {
        MARCONI.stdlib.log("opener window does not handle onHeightUpdate() event");
    }
}
function genericMapReportRadiusUpdate(radius) {
    try {
        if( opener && opener.MARCONI && opener.MARCONI.mapclient && opener.MARCONI.mapclient.onRadiusUpdate) {
            opener.MARCONI.mapclient.onRadiusUpdate(radius);
        }
    }
    catch(err) {
        MARCONI.stdlib.log("opener window does not handle onRadiusUpdate() event");
    }
}
function genericMapReportUnload(msg) {
    if( opener ) {
        opener.MARCONI.mapclient.onMapClose(msg);
    }
}

function genericMapReportPoint(latitude, longitude, locationText) {
    try {
        var eventFuncPrototype="";

        if( opener ) {
            try {
                if( !locationText ) {
                    MARCONI.stdlib.log("invoking point update");
                    eventFuncPrototype = "onPointUpdate(lat, lng)";
                    opener.MARCONI.mapclient.onPointUpdate(latitude, longitude);
                }
                else {
                    MARCONI.stdlib.log("invoking find-point");
                    eventFuncPrototype = "onMapFind(evt, lat, lng, locationText)";
                    opener.MARCONI.mapclient.onMapFind(latitude, longitude, locationText);
                }
            }
            catch( clickErr ) {
                MARCONI.stdlib.log("opener window does not handle event " + eventFuncPrototype + ", gave error " + clickErr);
            }
       }
    }
    catch(err) {
        throw("Error processing user map event");
    }

}
function genericMapReportClick(latitude, longitude) {
    try {
        var eventFuncPrototype="";

        if( opener ) {
            try {
                
                eventFuncPrototype = "onMapClick(lat, lng)";
                opener.MARCONI.mapclient.onMapClick(latitude, longitude);
                
            }
            catch( clickErr ) {
                MARCONI.stdlib.log("opener window does not handle event " + eventFuncPrototype + ", gave error " + clickErr);
            }
       }
    }
    catch(err) {
        throw("Error processing user map event");
    }

}
function fixedLlString(lat,lng, places) {
	var s = "N";
	var w = "E";
	if (lat < 0){
		lat = -lat;
		s = "S";
		}
	if(lng < 0){
		lng = -lng;
		w = "W";
	}
    
    if( places === undefined ) {
        places=5;
    }

    var latRounded = Math.round(lat*Math.pow(10.0, places))/Math.pow(10.0, places);
    //var lngRounded = Math.round(lng*Math.pow(10.0, places))/Math.pow(10.0, places);

	
	var val = MARCONI.stdlib.fixedFormatNumber(latRounded,1,places, true) + s + ", " + 
        MARCONI.stdlib.fixedFormatNumber(lng,1,places, true) + w;
    
    //MARCONI.stdlib.log("returning " + val + " for " + lat + ", " + lng);
    
    return val;
}
