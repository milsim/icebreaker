/* 
 * usng.js for OpenLayers
 * by Xavier Irias
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


var USNG = (function () {
    var latLongWGS84    = new MARCONI.map.SpatialReference(MARCONI.map.COORDSYS_WORLD, MARCONI.map.DATUM_HORIZ_WGS84, MARCONI.map.UNITS_DEGREES);
    var usngRef         = MARCONI.map.spatialRefGivenCode(MARCONI.map.SPATIALREF_USNG);
    var pt              = new MARCONI.map.GeoPoint();
    var grat=null;
    var map=null;
    var that;
    
    return {
        LLtoUSNG : function( latitude, longitude, precision ) {
        try {
            pt.x = longitude;
            pt.y = latitude;

            pt.convert(latLongWGS84, usngRef);

            return pt.x;
        }
        catch(ex) {
            throw("LLtoUSNG(): Error converting lat-long " + latitude + ", " + longitude +  " to USNG, err is " + ex);
        }
    },

    USNGtoLL : function(gridRef) {
        try {
            pt.x = gridRef;

            pt.convert(usngRef, latLongWGS84);
            
            return new OpenLayers.LonLat(pt.x, pt.y);
            
            var spatialRef = new esri.SpatialReference({wkid:4326});  // WGS84

            return new esri.geometry.Point(pt.x, pt.y, spatialRef);
        }
        catch(ex) {
            throw("USNGtoLL(): Error converting grid value " + gridRef + " to lat-long, err is " + ex);
        }
    },
    LLtoUTM : function ( latitude, longitude, utmcoords, zoneNumber) {
        try {
            zoneNumber = (zoneNumber ? zoneNumber : MARCONI.map.getUTMZoneFromLatLong(latitude, longitude));

            var utmRef = MARCONI.map.UTMSpatialRef(zoneNumber);

            pt.x = longitude;
            pt.y = latitude;

            pt.convert(latLongWGS84, utmRef);

            utmcoords[0] = pt.x;
            utmcoords[1] = pt.y;
            utmcoords[2] = zoneNumber;

        }
        catch(ex) {
            throw("LLtoUTM(): Error converting lat-long " + latitude + ", " + longitude + " zone " + zoneNumber + " to UTM, err is " + ex);
        }
    },
    UTMtoLL_GeoPoint : function ( x, y, zoneNumber) {
        try {
            var utmRef = MARCONI.map.UTMSpatialRef(zoneNumber);

            pt.x = x;
            pt.y = y;

            pt.convert(utmRef,latLongWGS84);

            return pt;
        }
        catch(ex) {
            throw("UTMtoLL_GeoPoint(): Error converting utm " + x + ", " + y + " zone " + zoneNumber + " to lat-long, err is " + ex);
        }
    },
    UTMtoLL : function ( x, y, zoneNumber) {
        try {
            var utmRef = MARCONI.map.UTMSpatialRef(zoneNumber);

            pt.x = x;
            pt.y = y;

            pt.convert(utmRef,latLongWGS84);

            return new OpenLayers.LonLat(pt.x, pt.y);
        }
        catch(ex) {
            throw("UTMtoLL(): Error converting utm " + x + ", " + y + " zone " + zoneNumber + " to lat-long, err is " + ex);
        }
    },
    
    Graticule : function(map, gridStyle) {   // constructor, use with new keyword
            
        function makeLabel(layer, latLong, labelText, color, opacity, textSize, textStyle, textWeight, fontFamily,
            horizontalAlignment, verticalAlignment) {
                
            horizontalAlignment     = horizontalAlignment || "center";
            verticalAlignment       = verticalAlignment   || "middle";

            var mapCoord = toMapCoords(latLong);

            color      = color      || "black";
            opacity    = opacity    || 1.0;
            textSize   = textSize   || "40px";
            textStyle  = textStyle  || "normal";
            textWeight = textWeight || "normal";
            fontFamily = fontFamily || "Arial";

            var point = new OpenLayers.Geometry.Point(mapCoord.lon, mapCoord.lat);

            var style = {
                label: labelText,
                xOffset: 0,
                yOffset: 0,
                labelAlign: horizontalAlignment.substr(0,1) + verticalAlignment.substr(0,1),
                pointRadius: 0,
                fontOpacity: opacity,
                fontColor: color,
                fontSize: textSize,
                fontWeight: textWeight,
                fontFamily: fontFamily
            };
            
            //MARCONI.stdlib.log(mapCoord.toString() + ", style=" + MARCONI.stdlib.logObject(style));

            var feature = new OpenLayers.Feature.Vector(point, null, style);
            layer.addFeatures([feature]);

            return feature;
        }    
        
        function makeLine(layer, latLongPath, color, opacity, weight) {
            try {
                if(!latLongPath || !latLongPath[0]) {
                    throw "Must supply latlong path";
                }
                var mapPoints=[];

                for( var i = 0 ; i < latLongPath.length ; i++) {
                    
                        var pt = new OpenLayers.Geometry.Point(
                            latLongPath[i].lon, latLongPath[i].lat );
                            
                        pt.transform( latLongProjection, m_map.getProjectionObject() );  
                        
                        mapPoints.push(pt);
                    
                    
                }
                var geo = new OpenLayers.Geometry.LineString(mapPoints);
                
                var style = {
                    fillOpacity :    opacity || 0.4,
                    graphicOpacity : opacity || 1.0,
                    fillColor : color,
                    strokeColor : color,
                    strokeWidth : weight,
                    strokeOpacity : opacity || 1.0,
                    rotation : 0
                }
                
                var feature  = new OpenLayers.Feature.Vector(geo, null, style);

                layer.addFeatures([feature]);

                return feature;
            }
            catch(ex) {
                throw "Error making zone boundary line: " + ex;
            }
        }
            
        function USNGViewport(extent) {   // adapted from similar viewport in Google graticule code
            // arrays that hold the key coordinates...corners of viewport and UTM zone boundary intersections
           this.lat_coords = [];
           this.lng_coords = [];

           // array that holds instances of the class USNG_Georectangle, for this viewport
           this.georectangle = [];

           // geographic coordinates of edges of viewport
           this.slat = extent.bottom;
           this.wlng = extent.left;
           this.nlat = extent.top;
           this.elng = extent.right;

           // UTM is undefined beyond 84N or 80S, so this application defines viewport at those limits
           if (this.nlat > 84) { 
               this.nlat=84;
           }

           // first zone intersection inside the southwest corner of the map window
           // longitude coordinate is straight-forward...

           var x1 = (Math.floor((this.wlng/6)+1)*6.0);

           // but latitude coordinate has three cases
           var y1 = (this.slat >= -80 ? Math.floor((this.slat/8)+1)*8.0 : -80);
           var i,j,k,lat,lng;

           // compute lines of UTM zones -- geographic lines at 6x8 deg intervals

           // latitudes first

           if (this.slat < -80) {
               this.lat_coords[0] = -80;
           }  // special case of southern limit
           else { 
               this.lat_coords[0] = this.slat;
           }  // normal case

           for( lat=y1, j=1; lat < this.nlat ; lat += 8, j++) {
              if (lat <= 72) {
                 this.lat_coords[j] = lat;
              }
              else if (lat <= 80) {
                 this.lat_coords[j] = 84;
              }
              else { 
                  j--;
              }
           }
           this.lat_coords[j] = this.nlat;

           // compute the longitude coordinates that belong to this viewport
           
           this.lng_coords[0] = this.wlng;
           if (this.wlng < this.elng) {   // normal case
              for (lng=x1, j=1; lng < this.elng ; lng+=6, j++) {
                 this.lng_coords[j] = lng;
              }
           }
           else { // special case of window that includes the international dateline
              for (lng=x1, j=1; lng <= 180; lng+=6, j++) {
                 this.lng_coords[j] = lng;
              }
              for (lng=-180; lng < this.elng; lng+=6, j++) {
                 this.lng_coords[j] = lng;
              }
           }

           this.lng_coords[j++] = this.elng;

           // store corners and center point for each geographic rectangle in the viewport
           // each rectangle may be a full UTM cell, but more commonly will have one or more
           //    edges bounded by the extent of the viewport
           // these geographic rectangles are stored in instances of the class 'USNG_Georectangle'
           k = 0;
           for (i=0; i < this.lat_coords.length-1 ; i++) {
              for (j = 0; j < this.lng_coords.length-1 ; j++) {
                 if(      this.lat_coords[i] >= 72 && this.lng_coords[j] ==  6 ) {  } // do nothing
                 else if (this.lat_coords[i] >= 72 && this.lng_coords[j] == 18 ) {  } // do nothing
                 else if (this.lat_coords[i] >= 72 && this.lng_coords[j] == 30 ) {  } // do nothing
                 else {
                    this.georectangle[k] = new USNG_Georectangle();
                    //MARCONI.stdlib.log("rect=" + MARCONI.stdlib.logObject(this.georectangle[k]));
                    
                    this.georectangle[k].assignCorners(this.lat_coords[i], this.lat_coords[i+1], this.lng_coords[j], this.lng_coords[j+1]);
                    
                    if (this.lat_coords[i] != this.lat_coords[i+1]) {  // ignore special case of -80 deg latitude
                       this.georectangle[k].assignCenter();
                    }
                    k++;
                 }
              }
           }
        } // end of function USNGViewport()

        // return array of latitude coordinates corresponding to lat lines
        USNGViewport.prototype.lats = function() {
           return this.lat_coords;
        };

        // return array of longitude coordinates corresponding to lng lines
        USNGViewport.prototype.lngs = function() {
           return this.lng_coords;
        };

        // return an array or georectangles associated with this viewprot
        USNGViewport.prototype.geoextents = function() {
           return this.georectangle;
        };
        
        function USNG_Georectangle() {
            this.nlat = 0;
            this.slat = 0;
            this.wlng=0;
            this.elng=0;
            this.centerlat=0;
            this.centerlng=0;

        }
        USNG_Georectangle.prototype.toString = function() {
            return this.slat  + ", " + this.wlng + " to " + this.nlat + ", " + this.elng;
        }
        
        USNG_Georectangle.prototype.assignCorners = function(slat,nlat,wlng,elng) {
            this.nlat = nlat;
            this.slat = slat;

            // special case: Norway
            if (slat==56 && wlng==0) {
              this.wlng = wlng;
              this.elng = elng-3;
            }
            else if (slat==56 && wlng==6) {
              this.wlng = wlng-3;
              this.elng = elng;
            }
            // special case: Svlabard
            else if (slat==72 && wlng==0) {
              this.wlng = wlng;
              this.elng = elng+3;
            }
            else if (slat==72 && wlng==12) {
              this.wlng = wlng-3;
              this.elng = elng+3;
            }
            else if (slat==72 && wlng==36) {
              this.wlng = wlng-3;
              this.elng = elng;
            }
            else {
              this.wlng = wlng;
              this.elng = elng;
            }
        };

        USNG_Georectangle.prototype.assignCenter = function() {
            this.centerlat = (this.nlat+this.slat)/2;
            this.centerlng = (this.wlng+this.elng)/2;
        };
        USNG_Georectangle.prototype.getCenter = function() {
              return(createLatLongPt(this.centerlat,this.centerlng));
        };

        USNG_Georectangle.prototype.getNW = function() {
              return(createLatLongPt(this.nlat,this.wlng));
        };
        USNG_Georectangle.prototype.getSW = function() {
              return(createLatLongPt(this.slat,this.wlng));
        };
        USNG_Georectangle.prototype.getSE = function() {
              return(createLatLongPt(this.slat,this.elng));
        };
        USNG_Georectangle.prototype.getNE = function() {
              return(createLatLongPt(this.nlat,this.elng));
        };
        
        
        // zones are defined by lines of latitude and longitude, normally 6 deg wide by 8 deg high
        // northern-most zone is 12 deg high, from 72N to 84N

        function USNGZonelines(layer, viewport, parent) {
            
            
            try {
               this.layer = layer;
               this.view = viewport;
               this.parent=parent;


               var latlines = this.view.lats();
               var lnglines = this.view.lngs();
               this.gzd_rectangles = this.view.geoextents();
               this.marker = [];
               var temp = [];
               var i;
               

               // creates polylines corresponding to zone lines using arrays of lat and lng points for the viewport
               for( i = 1 ; i < latlines.length ; i++) {
                   temp=[];

                   for (var j = 0 ; j < lnglines.length; j++) {
                       temp.push(createLatLongPt(latlines[i],lnglines[j]));
                   }
                   
                   makeLine(layer, temp, parent.gridStyle.majorLineColor, parent.gridStyle.majorLineOpacity, parent.gridStyle.majorLineWeight);
               }

               for( i = 1 ; i < lnglines.length ; i++ ) {
                   // need to reset array for every line of longitude!
                   temp = [];

                   // deal with norway special case at longitude 6
                   if( lnglines[i] == 6 ) {
                      for( j = 0 ; j < latlines.length ; j++ ) {
                         if (latlines[j]==56) {
                            temp.push(createLatLongPt(latlines[j], lnglines[i]));
                            temp.push(createLatLongPt(latlines[j], lnglines[i]-3));
                         }
                         else if( latlines[j]<56 || (latlines[j]>64 && latlines[j]<72)) {
                            temp.push(createLatLongPt(latlines[j], lnglines[i]));
                         }
                         else if (latlines[j]>56 && latlines[j]<64) {
                            temp.push(createLatLongPt(latlines[j],lnglines[i]-3));
                         }
                         else if (latlines[j]==64) {
                            temp.push(createLatLongPt(latlines[j], lnglines[i]-3));
                            temp.push(createLatLongPt(latlines[j], lnglines[i]));
                         }
                         // Svlabard special case
                         else if (latlines[j]==72) {
                            temp.push(createLatLongPt(latlines[j], lnglines[i]));
                            temp.push(createLatLongPt(latlines[j], lnglines[i]+3));
                         }
                         else if (latlines[j]<72) {
                            temp.push(createMapPt(latlines[j], lnglines[i]));
                         }
                         else if (latlines[j]>72) {
                            temp.push(createLatLongPt(latlines[j], lnglines[i]+3));
                          }
                         else {
                            temp.push(createLatLongPt(latlines[j],lnglines[i]-3));
                         }
                        }

                    }

                    // additional Svlabard cases

                    // lines at 12,18 and 36 stop at latitude 72
                    else if (lnglines[i] == 12 || lnglines[i] == 18 || lnglines[i] == 36) {
                       for (j = 0; j < latlines.length; j++) {
                         if (latlines[j]<=72) {
                            temp.push(createLatLongPt(latlines[j], lnglines[i]));
                         }
                       }
                    }
                    else if (lnglines[i] == 24) {
                      for (j=0; j < latlines.length ; j++) {
                         if (latlines[j] == 72) {
                            temp.push(createLatLongPt(latlines[j], lnglines[i]));
                            temp.push(createLatLongPt(latlines[j], lnglines[i]-3));
                         }
                         else if ( latlines[j] < 72) {
                            temp.push(createLatLongPt(latlines[j],lnglines[i]));
                         }
                         else if ( latlines[j] > 72) {
                            temp.push(createLatLongPt(latlines[j],lnglines[i]-3));
                         }
                      }
                    }
                    else if (lnglines[i] == 30) {
                      for ( j = 0 ; j < latlines.length ; j++) {

                         if( latlines[j] == 72 ) {
                            temp.push(createLatLongPt(latlines[j], lnglines[i]));
                            temp.push(createLatLongPt(latlines[j], lnglines[i]+3));
                         }
                         else if ( latlines[j] < 72 ) {
                            temp.push(createLatLongPt( latlines[j], lnglines[i]));
                         }
                         else if ( latlines[j] > 72 ) {
                            temp.push(createLatLongPt( latlines[j], lnglines[i]+3));
                         }
                      }
                    }

                    // normal case, not in Norway or Svalbard
                    else {
                      for( j = 0 ; j < latlines.length; j++) {
                          temp.push(createLatLongPt(latlines[j], lnglines[i]));
                      }
                    }
                    
                    makeLine(layer, temp, parent.gridStyle.majorLineColor, parent.gridStyle.majorLineOpacity, parent.gridStyle.majorLineWeight);
                    
                }  // for each latitude line

                this.zonemarkerdraw(layer);
            }
            catch(ex) {
                throw("Error constructing USNG zone boundaries: " + ex);
            }
        }       // constructor


        // zone label markers
        USNGZonelines.prototype.zonemarkerdraw = function(layer) {
            
            
            var i;
            
            for (i = 0 ; i < this.gzd_rectangles.length; i++ ) {

                var lat = this.gzd_rectangles[i].getCenter().lat;

                var lng = this.gzd_rectangles[i].getCenter().lon;

                // labeled marker
                var z = USNG.LLtoUSNG(lat,lng,1);

                z = z.substring(0,3);

                this.marker.push(makeLabel(layer, 
                    this.gzd_rectangles[i].getCenter(), z, 
                    this.parent.gridStyle.majorLabelColor,
                    this.parent.gridStyle.majorLabelOpacity,
                    this.parent.gridStyle.majorLabelSize,   // e.g. 20px
                    this.parent.gridStyle.majorLabelStyle,  // italic or oblique or null for normal
                    this.parent.gridStyle.majorLabelWeight, // bold, bolder or null for normal
                    this.parent.gridStyle.majorLabelFont)   // e.g. "Arial"
                );

            }
        }  

        function Grid100klines(layer, viewport, parent) {
            this.layer = layer;
            this.view = viewport;
            this.parent = parent;
            
            
            this.zones = this.view.geoextents();

            for (var i=0; i < this.zones.length; i++) {
                var newCell = new Gridcell(this.layer, this.parent, this.zones[i],100000);

                newCell.drawOneCell();
            }
        }

        
        function Grid1klines(layer, viewport, parent) {
            this.layer  = layer;
            this.view   = viewport;
            this.parent = parent;
            
            this.zones = this.view.geoextents();

            for (var i = 0 ; i < this.zones.length ; i++ ) {
                var newCell = new Gridcell(this.layer, this.parent, this.zones[i], 1000);
                newCell.drawOneCell();
            }
        }

        function Grid100mlines(layer, viewport, parent) {
            this.layer = layer;
            this.view = viewport;
            this.parent = parent;
            
            this.zones = this.view.geoextents();

            for (var i=0; i<this.zones.length; i++) {
               var newCell = new Gridcell(layer, parent, this.zones[i], 100);
               newCell.drawOneCell();
            }
        }

        


        // constructor
        function Gridcell(layer, parent, zones, interval) {
            if(!layer) {
                throw "layer argument not supplied to Gridcell constructor";
            }
            if(!parent) {
                // TODO -- check some properties of parent to make sure it's real
                throw "parent USNG grid not supplied to Gridcell constructor";
            }

            this.layer    = layer;
            
            this.parent = parent;   // provides access to gridStyle for example
            this.slat   = zones.slat;
            this.wlng   = zones.wlng;
            this.nlat   = zones.nlat;
            this.elng   = zones.elng;

            this.interval   = interval;
        }

        // instance of one utm cell
        Gridcell.prototype.drawOneCell = function() {
            try {

                var utmcoords = [];

                var zone = MARCONI.map.getUTMZoneFromLatLong((this.slat+this.nlat)/2,(this.wlng+this.elng)/2);

                var i,j,k,m,n,p,q;

                USNG.LLtoUTM(this.slat,this.wlng,utmcoords, zone);

                var sw_utm_e = (Math.floor(utmcoords[0]/this.interval)*this.interval)-this.interval;
                var sw_utm_n = (Math.floor(utmcoords[1]/this.interval)*this.interval)-this.interval;


                USNG.LLtoUTM(this.nlat,this.elng,utmcoords,zone);


                var ne_utm_e = (Math.floor(utmcoords[0]/this.interval+1)*this.interval) + 10 * this.interval;
                var ne_utm_n = (Math.floor(utmcoords[1]/this.interval+1)*this.interval) + 10 * this.interval;


                if( sw_utm_n > ne_utm_n || sw_utm_e > ne_utm_e) {
                    throw("Error, northeast of cell less than southwest");
                }

                var geocoords    = null;
                var temp         = null;
                var gr100kCoord  = null;
                var northings    = [];
                var eastings     = [];

                // set density of points on grid lines as space in meters between points
                // case 1: zoomed out a long way; not very dense
                var precision;
                var zoom=that.map.getZoom();


                if( zoom < 12 ) {
                    precision = 10000;
                }
                // case 2: zoomed in a long way
                else if (zoom > 15) {
                   precision = 100;
                }
                // case 3: in between, zoom levels 12-15
                else {
                   precision = 1000;
                }

                precision *= 10;  // experiment here with a speedup multiplier
                if( precision > this.interval * 5) {
                    precision = this.interval * 5;
                }
                // ensure at least two vertices for each segment
                if( precision > ne_utm_n - sw_utm_n ) {
                    precision = ne_utm_n - sw_utm_n;
                }
                if( precision > ne_utm_e - sw_utm_e ) {
                    precision = ne_utm_e - sw_utm_e;
                }

                var skipFactor=1;
                
                if( this.interval==1000 && zoom == 11) {
                    skipFactor=2;
                }

                // for each e-w line that covers the cell, with overedge
                northings[0] = this.slat;
                k=1;
                for (i=sw_utm_n, j=0 ; i < ne_utm_n ; i += this.interval * skipFactor, j++) {

                    // collect coords to be used to place markers
                    // '2*this.interval' is a fudge factor that approximately offsets grid line convergence
                    geocoords = USNG.UTMtoLL_GeoPoint(sw_utm_e+(2*this.interval), i, zone);

                    if ((geocoords.y > this.slat) && (geocoords.y < this.nlat)) {
                        northings[k++] = geocoords.y;
                    }

                    // calculate  line segments of one e-w line
                    temp=[];
                    for( m = sw_utm_e ; m <= ne_utm_e ; m += precision ) {
                        temp.push(USNG.UTMtoLL(m, i, zone));
                    }

                    gr100kCoord = [];

                    // clipping routine...eliminate overedge lines
                    // case of final point in the array is not covered
                    for( p = 0  ; p < temp.length-1 ; p++ ) {
                      if( this.checkClip(temp, p) ) {
                          gr100kCoord.push( temp[p] );
                      }
                    }

                    if( gr100kCoord.length ) {
                    
                        if (this.interval == 100000) {
                           makeLine(this.layer, gr100kCoord, 
                               this.parent.gridStyle.semiMajorLineColor, this.parent.gridStyle.semiMajorLineOpacity, 
                               this.parent.gridStyle.semiMajorLineWeight);

                        }
                        else if (this.interval == 1000) {
                           makeLine(this.layer, gr100kCoord, 
                               this.parent.gridStyle.minorLineColor, this.parent.gridStyle.minorLineOpacity, 
                               this.parent.gridStyle.minorLineWeight);

                        }
                        else if (this.interval == 100) {
                           makeLine(this.layer, gr100kCoord, 
                               this.parent.gridStyle.fineLineColor, this.parent.gridStyle.fineLineOpacity, 
                               this.parent.gridStyle.fineLineWeight);
                        }
                    }
                }

                northings[k++] = this.nlat;
                eastings[0] = this.wlng;
                k=1;

                // for each n-s line that covers the cell, with overedge
                for (i=sw_utm_e; i<ne_utm_e; i+=this.interval * skipFactor,j++) {

                  // collect coords to be used to place markers
                  // '2*this.interval' is a fudge factor that approximately offsets grid line convergence
                  geocoords = USNG.UTMtoLL_GeoPoint(i, sw_utm_n+(2*this.interval), zone);

                  if (geocoords.x > this.wlng && geocoords.x < this.elng) {
                      eastings[k++] = geocoords.x;
                  }

                  temp=[];

                  for (m=sw_utm_n,n=0; m<=ne_utm_n; m+=precision,n++) {

                     temp.push(USNG.UTMtoLL(i, m, zone));
                  }

                  // clipping routine...eliminate overedge lines
                  gr100kCoord  = [];
                  for (p=0 ; p < temp.length-1; p++) {
                      if ( this.checkClip(temp,p)) {
                          gr100kCoord.push(temp[p]);
                      }
                  }

                  if( gr100kCoord.length ) {
                      
                      if (this.interval == 100000) {
                         makeLine(this.layer, gr100kCoord, 
                               this.parent.gridStyle.semiMajorLineColor, this.parent.gridStyle.semiMajorLineOpacity, 
                               this.parent.gridStyle.semiMajorLineWeight);
                      }
                      else if (this.interval == 1000) {
                         makeLine(this.layer, gr100kCoord, 
                               this.parent.gridStyle.minorLineColor, this.parent.gridStyle.minorLineOpacity, 
                               this.parent.gridStyle.minorLineWeight);
                      }
                      else if (this.interval == 100) {
                         makeLine(this.layer, gr100kCoord, 
                               this.parent.gridStyle.fineLineColor, this.parent.gridStyle.fineLineOpacity, 
                               this.parent.gridStyle.fineLineWeight);
                      }
                  }
                  
                }

                eastings[k] = this.elng;

                if (this.interval == 100000) {
                    //MARCONI.stdlib.log("Placing 100km labels");
                    
                    this.place100kLabels(eastings,northings);
                }
                else if (this.interval == 1000) {
                    //MARCONI.stdlib.log("Placing 1000m labels");
                    
                   this.place1kLabels(eastings,northings);
                }
                else if (this.interval == 100) {
                    //MARCONI.stdlib.log("Placing 100m labels");

                    this.place100mLabels(eastings,northings);
                }
             }
             catch(oneCellErr) {
               throw("Error drawing a cell: " + oneCellErr);
             }
        }  // end drawOneCell

        Gridcell.prototype.place100kLabels = function(east,north) {
            try {

                var zone;
                var labelText;
                var latitude;
                var longitude;
                var zoom = that.map.getZoom();

                if( zoom > 15) {
                    return; // don't display label when zoomed way in
                }

                for (var i=0 ; east[i+1] ; i++ ) {
                    for (var j=0; north[j+1]; j++) {
                        // labeled marker
                        zone = MARCONI.map.getUTMZoneFromLatLong((north[j]+north[j+1])/2,(east[i]+east[i+1])/2 );

                        // lat and long of center of area
                        latitude = (north[j]+north[j+1])/2;

                        longitude = (east[i] + east[i+1])/2;

                        labelText = USNG.LLtoUSNG(latitude, longitude);

                        // if zoomed way out use a different label

                        if (zoom < 10) {
                            if (zone > 9) {
                                labelText = labelText.substring(4,6)
                            }
                            else {
                                labelText = labelText.substring(3,5)
                            }
                        }
                        else {
                            if (zone > 9) {
                                labelText = labelText.substring(0,3) + labelText.substring(4,6)
                            }
                            else {
                                labelText = labelText.substring(0,2) + labelText.substring(3,5)
                            }

                        }

                        makeLabel(
                            this.layer, createLatLongPt(latitude,longitude), labelText, 
                            this.parent.gridStyle.semiMajorLabelColor, 
                            this.parent.gridStyle.semiMajorLabelOpacity,
                            this.parent.gridStyle.semiMajorLabelSize,
                            this.parent.gridStyle.semiMajorLabelStyle,
                            this.parent.gridStyle.semiMajorLabelWeight,
                            this.parent.gridStyle.semiMajorLabelFont,
                            "center", "middle"
                        );

                    }
                }
            }
           catch(markerError) {
               throw("Error placing 100k markers: " + markerError);
           }
        }

        Gridcell.prototype.place1kLabels = function(east,north) {
           try {

               var latitude;
               var longitude;
               var zoom = that.map.getZoom();

               // at high zooms, don't label the 1k line since it'll get a 100m label'
               if (zoom > 15) {
                   return;
               }

               var skipFactor = 2;

               // place labels on N-S grid lines (that is, ladder labels lined up in an E-W row)

               // label x-axis
               for (var i=1; east[i+1]; i++) {
                  for (var j=1; j<2; j++) {
                       // labeled marker
                       latitude  = (north[j]+north[j+1])/2;
                       longitude = east[i];
                       var gridRef = USNG.LLtoUSNG(latitude, longitude);
                       var parts = gridRef.split(" ");

                       var x = parseFloat(parts[2].substr(0,2));

                       var z = parseFloat(parts[2].substr(2,3));
                       if( z > 500 ) {  // round
                            x++;
                            z=0;
                       }
                       
                       if( !( x % skipFactor) ) {

                         var labelText = "" + x +"k";
                         makeLabel(this.layer, createLatLongPt(latitude,longitude), labelText,
                            this.parent.gridStyle.minorLabelColor,
                            this.parent.gridStyle.minorLabelOpacity,
                            this.parent.gridStyle.minorLabelSize,
                            this.parent.gridStyle.minorLabelStyle,
                            this.parent.gridStyle.minorLabelWeight,
                            this.parent.gridStyle.minorLabelFont, "left", "top");
                       }
                  }
               }

               // place labels on y-axis
               for (i=1; i<2; i++) {
                  for (j=1; north[j+1]; j++) {
                       // labeled marker
                       latitude  = north[j];
                       longitude = (east[i]+east[i+1])/2;

                       gridRef  = USNG.LLtoUSNG(latitude,longitude);

                       parts = gridRef.split(" ");

                       var y = parseFloat(parts[3].substr(0,2));
                       z = parseFloat(parts[3].substr(2,3));
                       if( z > 500 ) {  // round
                            y++;
                            z=0;
                       }
                        
                       if( !(y % skipFactor) ) {
                           
                           labelText = "" + y +"k";

                           makeLabel(this.layer, createLatLongPt(latitude,longitude), labelText, 
                                this.parent.gridStyle.minorLabelColor, 
                                this.parent.gridStyle.minorLabelOpacity,
                                this.parent.gridStyle.minorLabelSize,
                                this.parent.gridStyle.minorLabelStyle,
                                this.parent.gridStyle.minorLabelWeight,
                                this.parent.gridStyle.minorLabelFont,"center", "top");
                       }
                       
                 }
               }
           }
           catch(ex) {
               throw("Error placing 1k markers: " + ex);
           }
        }  // end place1kLabels()

        Gridcell.prototype.place100mLabels = function(east,north) {
            try {
                var zoom = that.map.getZoom();

                // only label lines when zoomed way in
                if( zoom < 14) {
                    MARCONI.stdlib.log("Zoom of " + zoom + " is too far-out for 100m labels");
                    return;
                }

                var skipFactor = (zoom > 15 ? 1 : 2);

                if( east.length < 2 || north.length < 2 ) {
                    MARCONI.stdlib.log("100m labels unneeded for uber-short line");
                }

                //MARCONI.stdlib.log("Placing 100m labels, zoom is " + this._map.getZoom());

                // place "x-axis" labels
                for (var i = 1; east[i+1] ; i+= 1) {
                    for (var j=1; j< 2; j++) {

                        var gridRef  = USNG.LLtoUSNG((north[j]+north[j+1])/2, east[i]);
                        var parts = gridRef.split(" ");

                        var x = parseFloat(parts[2].substr(0,3));
                        var z = parseFloat(parts[2].substr(3,2));
                        if( z > 50 ) {
                            x++;
                            z=0;
                        }

                        if( !(x % skipFactor) ) {

                            var insigDigits = (skipFactor == 1 || !(x%10) ? "oo" : "");

                            makeLabel(this.layer, createLatLongPt((north[j]+north[j+1])/2,(east[i])),
                                MARCONI.stdlib.fixedFormatNumber(x, 1, 0, true) + insigDigits, 
                                this.parent.gridStyle.fineLabelColor, 
                                this.parent.gridStyle.fineLabelOpacity,
                                this.parent.gridStyle.fineLabelSize,
                                this.parent.gridStyle.fineLabelStyle,
                                this.parent.gridStyle.fineLabelWeight,
                                this.parent.gridStyle.fineLabelFont,"left", "top"
                                );
                        }
                    }
                }

                // place "y-axis" labels, don't worry about skip factor since there's plenty of room comparatively
                for (i=1; i<2; i++) {
                    for (j=1; north[j+1]; j++) {
                        gridRef  = USNG.LLtoUSNG(north[j],(east[i]+east[i+1])/2,4);
                        parts = gridRef.split(" ");

                        var y = parseFloat(parts[3].substr(0,3));
                        z     = parseFloat(parts[3].substr(3,2));

                        // if due to roundoff we got something like 99 for z, make it a perfect zero
                        if( z > 50 ) {
                            y++;
                            z=0;
                        }

                        makeLabel(
                            this.layer,
                            createLatLongPt((north[j]),(east[i]+east[i+1])/2),
                            MARCONI.stdlib.fixedFormatNumber(y,1,0,true) + "oo", 
                            this.parent.gridStyle.fineLabelColor, 
                            this.parent.gridStyle.fineLabelOpacity,
                            this.parent.gridStyle.fineLabelSize,
                            this.parent.gridStyle.fineLabelStyle,
                            this.parent.gridStyle.fineLabelWeight,
                            this.parent.gridStyle.fineLabelFont,"center", "top"
                            );

                    }
                }
           }
           catch(ex) {
               MARCONI.stdlib.log("Error placing 100-meter markers: " + ex);
               throw("Error placing 100-meter markers: " + ex);
           }
        }  // end place100mLabels()

        Gridcell.prototype.checkClip = function(cp, p) {
            ///  implementation of Cohen-Sutherland clipping algorithm to clip grid lines at boundarie
            //        of utm zones and the viewport edges

            var that=this;  // so private funcs can see this via that

            function outcode(lat,lng) {
                var code = 0;
                if (lat < that.slat) {
                    code |= 4;
                }
                if (lat > that.nlat) {
                    code |= 8;
                }
                if (lng < that.wlng) {
                    code |= 1;}
                if (lng > that.elng) {
                    code |= 2;
                }
                return code;
            }
            function inside(lat,lng) {
                if (lat < that.slat || lat > that.nlat) {
                    return 0;
                }
                if (lng < that.wlng || lng > that.elng) {
                    return 0;
                }
                return 1;
            }

                var temp;
                var t;
                var u1=cp[p].lon;
                var v1=cp[p].lat;
                var u2=cp[p+1].lon;
                var v2=cp[p+1].lat;
                var code1 = outcode(v1, u1);
                var code2 = outcode(v2, u2);

                if ((code1 & code2) != 0) {   // line segment outside window...don't draw it
                  return null;
                }
                if ((code1 | code2) == 0) {   // line segment completely inside window...draw it
                  return 1;
                }
                if (inside(v1,u1)) {  // coordinates must be altered
                  // swap coordinates
                  temp = u1;
                  u1 = u2;
                  u2 = temp;

                  temp = v1;
                  v1 = v2;
                  v2 = temp;

                  temp = code1;
                  code1 = code2;
                  code2 = temp;
               }
               if (code1 & 8) { // clip along northern edge of polygon
                  t = (this.nlat - v1)/(v2-v1)
                  u1 += t*(u2-u1)
                  v1 = this.nlat
                  cp[p] = createLatLongPt(v1,u1)
               }
               else if (code1 & 4) { // clip along southern edge
                  t = (this.slat - v1)/(v2-v1);
                  u1 += t*(u2-u1);
                  v1 = this.slat;
                  cp[p] = createLatLongPt(v1,u1);
               }
               else if (code1 & 1) { // clip along west edge
                  t = (this.wlng - u1)/(u2-u1);
                  v1 += t*(v2-v1);
                  u1 = this.wlng;
                  cp[p] = createLatLongPt(v1,u1);
               }
               else if (code1 & 2) { // clip along east edge
                  t = (this.elng - u1)/(u2-u1);
                  v1 += t*(v2-v1);
                  u1 = this.elng;
                  cp[p] = createLatLongPt(v1,u1);
               }

               return 1;
            }

        var latLongProjection = new OpenLayers.Projection("EPSG:" + WKID_WGS84);


        var grat=null;
        that=this;
        
        var zoomListener=null;
        var panListener=null;
        
        this.map=map;
        this.gridStyle = gridStyle || window.m_GridStyle;
        
        MARCONI.stdlib.log("creating USNG graticule for map " + map.toString());
        
        this.remove = function(preserveEventHandlers) {
            if( grat ) {
                MARCONI.stdlib.log("removing USNG graticule " + grat.toString());
                try {
                    grat.removeAllFeatures();
                }
                catch(ex) {
                    MARCONI.stdlib.log("error removing features from USNG graticule: " + ex);
                }
                try {
                    map.removeLayer(grat);
                }
                catch(ex) {
                    MARCONI.stdlib.log("error removing USNG graticule layer from map: " + ex);
                }
                grat=null;
            }
            
            if( preserveEventHandlers !== true && zoomListener && panListener ) {
                m_map.events.unregister( "zoomend", m_map,  zoomListener);
        
                m_map.events.unregister( "moveend", m_map,  panListener);
                
                zoomListener=null;
                panListener=null;
            }
            
        };
        
        this.draw = function() {
            that.remove(true);
            
            //Create graphics layer 
            grat = new OpenLayers.Layer.Vector("USNG", {
                styleMap: new OpenLayers.StyleMap({
                    "default": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                        fillColor: "red",
                        strokeColor: "gray",
                        graphicName: "square",
                        rotation: 0,
                        pointRadius: 4,
                        fillOpacity : 0.3,
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
            
            map.addLayer(grat);
            
            draw(grat);
            
        };
        
        this.gridValueFromPt = function(latLongPt) {
            return USNG.LLtoUSNG(latLongPt.lat, latLongPt.lon);
        }
        
        this.draw();
        
        zoomListener = function() {
            MARCONI.stdlib.log("zooming");
            that.draw();
        }
        panListener = function() {
            MARCONI.stdlib.log("panning");
            that.draw();
        }
        m_map.events.register( "zoomend", m_map,  zoomListener);
        
        m_map.events.register( "moveend", m_map,  panListener);
        
        
        function draw(layer) {
            
            try {
                if( !layer ) {
                    throw "Layer not provided to graticule draw()";
                }
                
                var zoomLevel = that.map.getZoom();
                var proj = new OpenLayers.Projection("EPSG:" + WKID_WGS84);

                
                var extent = that.map.getExtent();  // in web mercator meters
                
                MARCONI.stdlib.log("map extent in meters is " + extent.toString());
                
                extent.transform(that.map.getProjectionObject(), proj );  // from map units to latlong
                
                MARCONI.stdlib.log("map extent in degrees is " + extent.toString());
                
                
                MARCONI.stdlib.log("Draw USNG graticule, zoom level=" + zoomLevel);
                
                var viewport = new USNGViewport(extent);

                if( zoomLevel < 6 ) {   // zoomed way out
                    that.zoneLines = new USNGZonelines(layer, viewport, that);
                }
                else {  // close enough to draw the 100km lines
                    // zone lines are also the boundaries of 100k lines...separate instance of this class for 100k lines
                    that.zonelines = new USNGZonelines(layer, viewport, that);

                    
                    that.grid100k = new Grid100klines(layer, viewport, that);

                    if( zoomLevel > 10 ) {    // draw 1k lines also if close enough
                        that.grid1k = new Grid1klines(layer, viewport, that);

                        if( zoomLevel > 13 ) {   // draw 100m lines if very close
                            that.grid100m = new Grid100mlines(layer, viewport, that);
                        }
                    }
                }
            }
            catch(ex) {
                MARCONI.stdlib.log("Error " + ex + " drawing USNG graticule");
            }
        }
    }
};
}());

