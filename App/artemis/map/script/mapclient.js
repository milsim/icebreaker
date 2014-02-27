/*
 *  mapclient.js for map samples -- this file standardizes the methods and event handlers for all pages that are "map clients" -- the pages
 *  that invoke popup map windows.  These client pages normally call showMap() with various arguments which include
 *  callback functions triggered by mapclient 
 *  
 *  This page depends on map.js
 *
 *
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

MARCONI.mapclient = (MARCONI.mapclient ? MARCONI.mapclient : function() {

    var m_mapWindow=null;
    var m_mapReadOnly=false;
    var m_openingMap=false;
    
    // events, handlers may be passed to showMap function
    var m_onClose=null;
    var m_onRadiusUpdate=null;
    var m_onLinearUnitsUpdate=null;
    var m_onPointUpdate=null;
    var m_onWidthUpdate=null;
    var m_onHeightUpdate=null;
    var m_onMapClick=null;
    var m_onGeometryUpdate=null;
    var m_onFind=null;
    
    function getExtentsOfCircle(pts) {
        try {
            if( !pts || pts.length !== 2 ) {
                throw "Must pass exactly two points, a center and a circumferential point";
            }
            
            // compute bounding box from center and a random circumferential point
                    
            var pt1 = new MARCONI.map.GeoPoint(pts[0].longitude, pts[0].latitude);
            var pt2 = new MARCONI.map.GeoPoint(pts[1].longitude, pts[1].latitude);

            var radius = MARCONI.map.metersBetween(pt1, pt2);
            var north  = MARCONI.map.getPointShifted(pt1.y, pt1.x, 0, radius, MARCONI.map.UNITS_METERS);
            var south  = MARCONI.map.getPointShifted(pt1.y, pt1.x, 0, -radius, MARCONI.map.UNITS_METERS);
            var west   = MARCONI.map.getPointShifted(pt1.y, pt1.x, -radius, 0, MARCONI.map.UNITS_METERS);
            var east   = MARCONI.map.getPointShifted(pt1.y, pt1.x, radius,  0, MARCONI.map.UNITS_METERS);

            return {
                sw: { latitude: south.y,
                      longitude: west.x
                },
                ne: { latitude:  north.y,
                      longitude: east.x
                }
            };
                    }
        catch(ex) {
            throw "Error computing extents of circle: " + ex;
        }
    }
    function getExtentsOfPoly(pts) {
        var latMin, latMax, longMin, longMax;
        
        for( var i = 0 ; i < pts.length ; i++) {
            if( i===0) {

                latMin  = pts[i].latitude;
                longMin = pts[i].longitude;
                latMax  = pts[i].latitude;
                longMax = pts[i].longitude;
            }
            else {
                if( pts[i].latitude < latMin ) {
                    latMin = pts[i].latitude;
                }
                if( pts[i].longitude < longMin ) {
                    longMin = pts[i].longitude;
                }
                if( pts[i].latitude > latMax ) {
                    latMax = pts[i].latitude;
                }
                if( pts[i].longitude > longMax ) {
                    longMax = pts[i].longitude;
                }
            }
        }
        
        return {
            sw: {latitude: latMin, longitude: longMin},
            ne: {latitude: latMax, longitude: longMin}
        };
    }
    
    return {

    onMapFind : function (latitude, longitude, findLocation) {
        if( m_onFind ) {
            m_onFind(latitude, longitude, findLocation);
        }
    },
    onPointUpdate : function(latitude, longitude) {
        try {
        
            if( m_onPointUpdate ) {
                m_onPointUpdate(latitude, longitude);
            }
            }
        catch(ex) {
            MARCONI.stdlib.log("Error " + ex + " receiving coords from map point update.");
        }
    },
    onMapClick : function (latitude, longitude) {
        try {
            if( m_onMapClick ) {
                m_onMapClick(latitude, longitude);
            }
        }
        catch(ex) {
            MARCONI.stdlib.log("Error " + ex + " receiving coords from map click.");
        }
    },
    onWidthUpdate : function(width) {
        
        if( m_onWidthUpdate ) {
            m_onWidthUpdate(width);
        }
    },
    onHeightUpdate : function(height) {
        
        if( m_onHeightUpdate ) {
            m_onHeightUpdate(height);
        }
    },
    onRadiusUpdate : function(radius) {
        
        if( m_onRadiusUpdate ) {
            m_onRadiusUpdate(radius);
        }
    },
    onLinearUnitsUpdate : function(units) {
        
        if( m_onLinearUnitsUpdate ) {
            m_onLinearUnitsUpdate(units);
        }
    },
    onGeometryUpdate : function(itemType, pts) {
        // this func is called by map windows when geometry changes
        try {
            
            if( m_onGeometryUpdate ) {
            
                if( typeof(itemType) !== "string") {
                    throw("function needs itemType arg");
                }

                if( MARCONI.stdlib.typeOf(pts) !== "array")
                    throw("function onGeometryUpdate() needs a pts array, got " + MARCONI.stdlib.typeOf(pts));

                var extents=null;
                var center=null;

                switch( itemType ) {
                    case "POLYGON":
                    case "LINE":
                        // compute bounding box
                        extents = getExtentsOfPoly(pts);

                        break;

                    case "EXTENTS":
                        extents = {
                            sw: { latitude: pts[0].latitude, longitude: pts[0].longitude },
                            ne: { latitude: pts[1].latitude, longitude: pts[1].latitude }
                        };

                        break;

                    case "CIRCLE":
                        extents = getExtentsOfCircle(pts);
                        center = pts[0];
                        
                        break; 

                    default:
                        throw "Unrecognized geometry type passed to mapclient.onGeometryUpdate()";
                }

                var metrics = extents == null ? null: 
                    {   
                        extents:extents, 
                        
                        center: center || {  
                            latitude: 0.5*(extents.sw.latitude + extents.ne.latitude),
                            longitude: 0.5*(extents.ne.longitude + extents.ne.longitude) }
                    };
                
                
                m_onGeometryUpdate( itemType, pts, metrics );
                
            }
        }
        catch(updateErr) {
            MARCONI.stdlib.log("Error invoking onGeometryUpdate(): " + updateErr);
        }
    },

    
    isOpening : function () {
        return m_openingMap;
    },

    showMap : function(args) {
        if(!args) {
            throw "showMap() missing required args";
        }
        if( !args.mapProvider ) {
            throw "mapProvider missing";
        }
        
        // optional events 
        m_onClose               = args.onClose;
        m_onRadiusUpdate        = args.onRadiusUpdate;
        m_onLinearUnitsUpdate   = args.onLinearUnitsUpdate;
        m_onWidthUpdate         = args.onWidthUpdate;
        m_onHeightUpdate        = args.onHeightUpdate;
        m_onMapClick            = args.onMapClick;
        m_onGeometryUpdate      = args.onGeometryUpdate;
        m_onFind                = args.onFind;
        m_onPointUpdate         = args.onPointUpdate;
        try {

            MARCONI.stdlib.log("map provider is " + args.mapProvider + ", spatial ref specified as " + args.spatialReferenceCD);

            if( !m_mapWindow) {
                
                var url= "./" + args.mapProvider.toLowerCase() + ".html";

                var params="";

                // default spatial ref is the one natively stored in database.  It's always passed to the mapping modules
                var defaultSpatialRef  = MARCONI.map.spatialRefGivenCode(MARCONI.map.SPATIALREF_FOR_STORAGE);

                // infer spatial ref using either single spatial-ref listbox or component listboxes as appropriate
                var spatialRefIn = args.spatialReferenceCD ? MARCONI.map.spatialRefGivenCode(args.spatialReferenceCD) : null;
                
                if( !spatialRefIn  ) {
                    if( args.x && args.y ) {
                        spatialRefIn = MARCONI.map.defaultSpatialRefGivenXY(args.x, args.y) ;
                    }
                    else {
                         spatialRefIn=MARCONI.map.spatialRefGivenCode(MARCONI.map.SPATIALREF_FOR_STORAGE);
                    }
                }
                
                if( !spatialRefIn ) {
                    throw("Unable to determine input spatial reference!");
                }

                if( args.locationDescription  ) {
                    params += (params ? "&" : "") + "Location=" + escape(args.locationDescription);
                }

                var itemToEdit = args.itemToEdit || "";

                var pt = null;
                
                if( args.x ) {
                    pt = new MARCONI.map.GeoPoint( args.x, args.y );
                    pt.convert(spatialRefIn, defaultSpatialRef, args.datumShiftMethodCD);
                    
                    params += (params ? "&" : "") + "Latitude=" + pt.y + "&Longitude=" + pt.x;

                    MARCONI.stdlib.log("Initial point has x-y of " + args.x + ", " + args.y + 
                        (spatialRefIn ? ", spatial ref " + spatialRefIn.spatialReferenceCD : "") + 
                        ", lat-long is " + pt.y + ", " + pt.x );
                }
                
                if( itemToEdit ) {
                    params += (params ? "&" : "") + "ItemToEdit=" + itemToEdit;
                
                    // readonly need only be stated if editing

                    m_mapReadOnly = (typeof(args.readOnly) != "undefined" ? args.readOnly : false);
                
                    if( m_mapReadOnly ) {
                        params += "&ReadOnly=true";
                    }
                }
                    
                if( args.linearUnitCD ) {
                    params += "&LinearUnitCD=" + args.linearUnitCD;
                }
                
                

                switch( itemToEdit ) {
                    case "":
                    case "POINT":
                        // nothing to do
                        break;

                    case "EXTENTS":
                        if( args.latitudeMin && args.longitudeMin && args.latitudeMax && args.longitudeMax ) {

                            MARCONI.stdlib.log("Initializing rectangle from explicit extents");
                            
                            params += 
                                  "&LatitudeMin="  + args.latitudeMin +
                                  "&LatitudeMax="  + args.latitudeMax +
                                  "&LongitudeMin=" + args.longitudeMin +
                                  "&LongitudeMax=" + args.longitudeMax;
                        }
                        else if( args.width && args.height ) {  // use dimensions if not using explicit boundary points
                            
                            MARCONI.stdlib.log("Rectangle given by center location and dimensions of " + args.width + " by " + args.height + " " + args.linearUnitCD);
                        }
                        else {
                            MARCONI.stdlib.log("Rectangle initial extents are not explicitly provided");
                        }
                        
                        // pass on width and height if given since they can be used even if not the defining params
                        if( args.width && args.height ) {
                            params += "&Width=" + args.width + "&Height=" + args.height;
                        }
                        if( args.defaultSize ) {
                            params += "&DefaultSize=true";
                        }
                        
                        break;


                    case "CIRCLE":
                        
                        if( !args.radius && (typeof(args.circumLatitude)==="undefined" || typeof(args.circumLongitude)==="undefined" )) {
                            throw "Must provide arguments radius OR circumLatitudeSource and circumLongitudeSource when editing or showing a circle";
                        }
                        
                        var circumLatitude  = args.circumLatitude;
                        
                        var circumLongitude = args.circumLongitude;
                        
                        if( typeof(circumLatitude) !== "undefined" && typeof(circumLongitude) !== "undefined") {
                            params += "&CircumLatitude=" + circumLatitude + "&CircumLongitude=" + circumLongitude;
                        }
                        
                        if( args.radius ) {
                            params += "&Radius=" + args.radius;
                        }

                        if( args.defaultSize ) {
                            params += "&DefaultSize=true";
                        }

                        break;

                    case "POLYGON":
                    case "LINE":
                        if( !args.pointStringSource )
                            throw "Must provide argument pointStringSource when editing or showing a line or polygon";

                        params += "&PointStringSource=" + args.pointStringSource;

                        break;

                }

                if( args && args.mapType ) {
                    params += (params ? "&" : "") + "MapType=" + args.mapType;
                }

                if( args && args.mapExtent) {
                    params += (params ? "&" : "") + "MapExtent=" + args.mapExtent;
                }
                
                if( args && args.mapZoom) {  // 1=world, 20=max detail
                    params += (params ? "&" : "") + "Zoom=" + args.mapZoom;
                }

                m_openingMap=true;

                url += (params ? (url.indexOf("?") >=0 ? "&" : "?")  + params : "");

                m_mapWindow = window.open(url,
                    'mapWindow',
                    'scrollbars=yes, resizable=yes,alignment=center,top=50,left=50,status=yes,width=400,height=400');

                m_openingMap=false;

                m_mapWindow.focus();

                MARCONI.stdlib.log("opened new map window " + m_mapWindow);

            }
            else {
                m_mapWindow.focus();
            }
            return m_mapWindow;
        }
        catch(ex) {
            throw("Error opening map window: " + ex );
        }
    },

    onMapClose : function (msg) {
        // should be invoked by popup window
        MARCONI.stdlib.log("Got map-close event from map window, invoking map-close event on parent window");
        if( m_onClose ) {
            m_onClose(msg);
        }
        m_mapWindow=null;
    }};
}());  // execute func to obtain a singleton instance

