
// ***************************************************************************
// *  utm.js  
// * 
//    by Xavier Irias
// ****************************************************************************/
//
// Copyright (c) 2009 Larry Moore, jane.larry@gmail.com
// Released under the MIT License 
// http://www.opensource.org/licenses/mit-license.php 
// http://en.wikipedia.org/wiki/MIT_License
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.
//
//
//*****************************************************************************


var UTM_UTIL = (function() {
    var latLongWGS84    = new MARCONI.map.SpatialReference(MARCONI.map.COORDSYS_WORLD, MARCONI.map.DATUM_HORIZ_WGS84, MARCONI.map.UNITS_DEGREES);
    var utmRef          = MARCONI.map.spatialRefGivenCode(MARCONI.map.SPATIALREF_UTM_NAD83);
    var pt              = new MARCONI.map.GeoPoint();

    pt.setUTMzoneStyle("Letter");   // use letter codes not hemisphere designation

    return {
        LLtoUTM : function ( latitude, longitude, decimalDigits ) {
            try {
                if( typeof(latitude) !== "number" || typeof(longitude) !== "number" ) {
                    throw "Lat-long not provided";
                }

                pt.x = longitude;
                pt.y = latitude;

                if( !utmRef ) {
                    MARCONI.stdlib.log("UTM ref doesn't exist");
                }

                pt.convert(latLongWGS84, utmRef);
                var gridRef = pt.x;

                if( typeof(gridRef) != "string") {
                    MARCONI.stdlib.log("Bad UTM grid ref " + gridRef + " for lat,long of " + latitude + ", " + longitude);
                }
                else {

                    if( decimalDigits !== undefined && decimalDigits !== null ) {

                        var parts=gridRef.split(" ");



                        parts[1] = MARCONI.stdlib.fixedFormatNumber(parseFloat(parts[1]), 0, decimalDigits, true);
                        parts[2] = MARCONI.stdlib.fixedFormatNumber(parseFloat(parts[2]), 0, decimalDigits, true);

                        gridRef = parts.join(" ");
                    }
                }

                return gridRef;

            }
            catch(ex) {
                throw("LLtoUTM(): Error converting lat-long " + latitude + ", " + longitude +  " to UTM, err is " + ex);
            }
        },

        UTMtoLL : function (gridRef) {
            try {
                pt.x = gridRef;
                pt.y = "";

                pt.convert(utmRef, latLongWGS84);
                
                return new OpenLayers.LonLat(pt.x, pt.y);
            }
            catch(ex) {
                throw("UTMtoLL(): Error converting UTM grid value " + gridRef + " to lat-long, err is " + ex);
            }
        },
        UTMtoLL_GeoPoint : function (gridRef) {
            try {
                pt.x = gridRef;
                pt.y = "";

                pt.convert(utmRef, latLongWGS84);

                return new MARCONI.map.GeoPoint(pt.x, pt.y);
            }
            catch(ex) {
                throw("UTMtoLL(): Error converting UTM grid value " + gridRef + " to lat-long, err is " + ex);
            }
        },

        UTMfromXYandZone : function( x, y, zone, hemiSphere) {
            
            return "" + zone + (hemiSphere ? hemiSphere : "N") + " " + x + " " +  y;
        }
    };
}());

