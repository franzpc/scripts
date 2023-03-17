<script type="text/javascript">

        ///
        /// display a lat/lon in dms format and display those values in the appropriate
        /// text boxes.  NOTE: latHemi and lonHemi are integers which map directly onto
        /// the select options.
        ///
        function setDMS(lat, lon, latHemi, lonHemi) {
            var latDeg = lat.substr(0, 3);
            var latMin = lat.substr(4, 2);
            var latSec = lat.substring(7, lat.length - 1);

            var lonDeg = lon.substr(0, 3);
            var lonMin = lon.substr(4, 2);
            var lonSec = lon.substring(7, lon.length - 1);

            //
            // trim any leading zeros
            //
            if (latDeg.charAt(0) == "0") {
                latDeg = latDeg.substring(1, latDeg.length);
            }

            if (latDeg.charAt(0) == "0") {
                latDeg = latDeg.substring(1, latDeg.length);
            }

            if (lonDeg.charAt(0) == "0") {
                lonDeg = lonDeg.substring(1, lonDeg.length);
            }

            if (lonDeg.charAt(0) == "0") {
                lonDeg = lonDeg.substring(1, lonDeg.length);
            }

            document.getElementById("latDegrees").value = latDeg;
            document.getElementById("latMinutes").value = latMin;
            document.getElementById("latSeconds").value = latSec;

            document.getElementById("lonDegrees").value = lonDeg;
            document.getElementById("lonMinutes").value = lonMin;
            document.getElementById("lonSeconds").value = lonSec;

            document.getElementById("northOrSouth").selectedIndex = latHemi;
            document.getElementById("westOrEast").selectedIndex = lonHemi;
        }

        ///
        /// display standard UTM coordinates
        ///
        function setStandardUtm(x, y, utmz, southern) {
            document.getElementById("utmEasting").value = x;
            document.getElementById("utmNorthing").value = y;
            document.getElementById("utmZone").value = utmz;
            document.getElementById("utmHemi").selectedIndex = southern ? 1 : 0;
        }

        ///
        /// display NATO UTM coordinates
        ///
        function setNatoUtm(x, y, utmz, latz, digraph) {
            document.getElementById("natoEasting").value = x;
            document.getElementById("natoNorthing").value = y;
            document.getElementById("natoLonZone").value = utmz;
            document.getElementById("natoLatZone").value = latz;
            document.getElementById("natoDigraph").value = digraph;
        }

        ///
        /// display decimal lat/long
        ///
        function setDecimalDegrees(lat, lon) {
            document.getElementById("decimalLatitude").value = lat;
            document.getElementById("decimalLongitude").value = lon;
        }

        ///
        /// convert a position in decimal degrees to the various other formats. does 
        /// input validity checks prior to calling conversion routines...
        ///
        function convertDecimal() {
            var lat = parseFloat(document.getElementById("decimalLatitude").value);
            var lon = parseFloat(document.getElementById("decimalLongitude").value);
            var mapDatum = parseInt(document.getElementById("mapDatum").selectedIndex);

            if (isNaN(lat) || lat > 90 || lat < -90) {
                alert("Latitude must be between -90 and 90");
                return;
            }

            if (isNaN(lon) || lon > 180 || lon < -180) {
                alert("Longitude must be between -180 and 180");
                return;
            }

            var latStr = Geo.toDMS(lat, "dms", 4);
            var lonStr = Geo.toDMS(lon, "dms", 4);

            //
            // 0 is N or W hemisphere, 1 is S or E
            //
            setDMS(latStr, lonStr, lat >= 0 ? 0 : 1, lon < 0 ? 0 : 1);

            utmconv.setDatum(mapDatum);
            var coords = utmconv.latLngToUtm(lat, lon);

            setStandardUtm(coords.global.easting, coords.global.northing, coords.global.zone, coords.global.southern);
            setNatoUtm(coords.nato.easting, coords.nato.northing, coords.nato.lngZone, coords.nato.latZone, coords.nato.digraph);
            setPin();
        }

        ///
        /// convert a position in Degree, Minutes, Seconds format to the various other formats.
        /// does input validity checking prior to calling the conversion functions.
        ///
        function convertDMS() {
            var latDeg = parseInt(document.getElementById("latDegrees").value);
            var latMin = parseInt(document.getElementById("latMinutes").value);
            var latSec = parseFloat(document.getElementById("latSeconds").value);

            var lonDeg = parseInt(document.getElementById("lonDegrees").value);
            var lonMin = parseInt(document.getElementById("lonMinutes").value);
            var lonSec = parseFloat(document.getElementById("lonSeconds").value);

            var latHemi = document.getElementById("northOrSouth").selectedIndex;
            var lonHemi = document.getElementById("westOrEast").selectedIndex;

            if (isNaN(latDeg) || isNaN(latMin) || isNaN(lonDeg) || isNaN(lonMin)) {
                alert("Degrees and minutes must both be integers");
                return;
            }

            if (isNaN(latSec) || isNaN(lonSec)) {
                alert("Seconds must be a floating point number");
                return;
            }

            if (latDeg < 0 || latDeg > 90) {
                alert("Degrees must be a value between 0 and 90");
                return;
            }

            if (lonDeg < 0 || lonDeg > 180) {
                alert("Degrees must be a value between 0 and 180");
                return;
            }

            if (latMin < 0 || latMin >= 60 || lonMin < 0 || lonMin >= 60) {
                alert("Minutes must be a number between 0 and 59");
                return;
            }

            if (latSec < 0 || latSec >= 60 || lonSec < 0 || lonSec >= 60) {
                alert("Seconds must be a number greater than or equal to 0 and less than 60");
                return;
            }

            var latString = latDeg + " " + latMin + " " + latSec + (latHemi ? "S" : "N");
            var lonString = lonDeg + " " + lonMin + " " + lonSec + (lonHemi ? "E" : "W");

            var lat = Geo.parseDMS(latString);
            var lon = Geo.parseDMS(lonString);

            setDecimalDegrees(lat, lon);

            utmconv.setDatum(document.getElementById("mapDatum").selectedIndex);
            var coords = utmconv.latLngToUtm(lat, lon);

            setStandardUtm(coords.global.easting, coords.global.northing, coords.global.zone, coords.global.southern);
            setNatoUtm(coords.nato.easting, coords.nato.northing, coords.nato.lngZone, coords.nato.latZone, coords.nato.digraph);
            setPin();
        }

        ///
        /// convert a set of UTM coordinates into the various other formats.  checks input for validity 
        /// before calling the various conversion routines.
        ///
        function convertUTM() {
            var easting = parseFloat(document.getElementById("utmEasting").value);
            var northing = parseFloat(document.getElementById("utmNorthing").value);
            var zone = parseInt(document.getElementById("utmZone").value);
            var southern = parseFloat(document.getElementById("utmHemi").selectedIndex) == 1;

            if (isNaN(easting) || isNaN(northing)) {
                alert("Easting and northing must both be valid floating point numbers");
                return;
            }

            if (isNaN(zone)) {
                alert("Zone must be a valid integer");
                return;
            }

            if (zone < 1 || zone > 60) {
                alert("Longitude zone must be between 1 and 60");
                return;
            }

            if (northing < 0 || northing > 10000000) {
                alert("Northing must be between 0 and 10000000");
                return;
            }

            if (easting < 160000 || easting > 834000) {
                alert("Easting coordinate crosses zone boundries, results should be used with caution");
            }

            utmconv.setDatum(document.getElementById("utmHemi").selectedIndex);
            var latlon = utmconv.utmToLatLng(easting, northing, zone, southern);    // get lat/lon for this set of coordinates
            var coords = utmconv.utmToNato(easting, northing, zone, southern);      // get nato equivalents

            //
            // 0 is N or W hemisphere, 1 is S or E
            //
            setDMS(Geo.toDMS(latlon.lat, "dms", 4), Geo.toDMS(latlon.lng, "dms", 4), latlon.lat >= 0 ? 0 : 1, latlon.lng < 0 ? 0 : 1);
            setDecimalDegrees(latlon.lat, latlon.lng);
            setNatoUtm(coords.easting, coords.northing, coords.lngZone, coords.latZone, coords.digraph);
            setPin();
        }

        ///
        /// convert a set of NATO UTM coordinates to the various other formats.  does input validity
        /// checking prior to calling the conversion routines.
        ///
        function convertNATO() {
            var easting = parseFloat(document.getElementById("natoEasting").value);
            var northing = parseFloat(document.getElementById("natoNorthing").value);
            var lonZone = parseInt(document.getElementById("natoLonZone").value);
            var latZone = document.getElementById("natoLatZone").value;
            var digraph = document.getElementById("natoDigraph").value;

            digraph = digraph.toUpperCase();
            latZone = latZone.toUpperCase();

            if (isNaN(easting) || isNaN(northing) || isNaN(lonZone)) {
                alert("Easting, northing and longitude zone must all be valid numbers");
                return;
            }

            if (lonZone < 1 || lonZone > 60) {
                alert("Longitude zone must be between 1 and 60");
                return;
            }

            if (easting < 0 || easting > 100000 || northing < 0 || northing > 100000) {
                alert("Easting and northing values must be between 0 and 100000");
                return;
            }

            if (digraph.length != 2) {
                alert("Digraphs must be two characters in length");
                return;
            }

            if (latZone.length != 1) {
                alert("Latitude zone must be 1 character only");
                return;
            }

            var eltr = digraph.charAt(0);
            var nltr = digraph.charAt(1);

            if (eltr < "A" || eltr > "Z" || nltr < "A" || nltr > "Z") {
                alert("Digraph must consist of letters only");
                return;
            }

            if (latZone < "A" || latZone > "Z") {
                alert("Latitude zone must consist of a single letter");
                return;
            }

            if (eltr == "I" || eltr == "O") {
                alert("I and O are not valid first characters for a digraph");
                return;
            }

            if (nltr >= "W") {
                alert("W, X, Y and Z are not valid second letters for a digraph");
                return;
            }

            var eidx = utmconv.digraphLettersE.indexOf(eltr);
            if (Math.floor(eidx / 8) != ((lonZone - 1) - 3 * Math.floor((lonZone - 1) / 3))) {
                alert("Longitude zone and digraph are inconsistent.  Use results with caution");
            }

            utmconv.setDatum(document.getElementById("mapDatum").selectedIndex);
            var latlon = utmconv.natoToLatLng(easting, northing, lonZone, latZone, digraph);
            var coords = utmconv.natoToUtm(easting, northing, lonZone, latZone, digraph);

            setDMS(Geo.toDMS(latlon.lat, "dms", 4), Geo.toDMS(latlon.lng, "dms", 4), latlon.lat >= 0 ? 0 : 1, latlon.lng < 0 ? 0 : 1);
            setDecimalDegrees(latlon.lat, latlon.lng);
            setStandardUtm(coords.easting, coords.northing, coords.zone, coords.southern);
            setPin();
        }

        ///
        /// we don't ever want to submit this form
        ///
        function cancelSubmit(e) {
            // look for window.event in case event isn't passed in
            if (typeof e == 'undefined' && window.event) { e = window.event; }
            if (e.keyCode == 13) {
                return false;
            }
            return true;
        }

    </script>