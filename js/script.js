
$(document).ready(function () {
    var sevenDaysAgo;
    //initialize the leaflet map, set options and view
    var map = L.map('map', {
        //zoomControl: false,
        //scrollWheelZoom: false
    })
	.setView([35.7806, -78.6389], 12);

    var markers = new L.FeatureGroup();

    //add an OSM tileset as the base layer
    L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png').addTo(map);
    //$.getJSON("data/Citizen_Advisory_Council.json", function(data) {
    //    var geojson = L.geoJson(data);
    // });
    //L.geoJson('http://data.ral.opendata.arcgis.com/datasets/9a5733e13dd14e2f80f8517738ce8cc6_2.geojson').addTo(map);
    //call our getData() function.
    getData();

    //define a base icon
    var baseIcon = L.Icon.extend({
        options: {
            shadowUrl: 'img/shadow.png',

            iconSize: [32, 37], // size of the icon
            shadowSize: [51, 37], // size of the shadow
            iconAnchor: [16, 37], // point of the icon which will correspond to marker's location
            shadowAnchor: [25, 37],  // the same for the shadow
            popupAnchor: [1, -37] // point from which the popup should open relative to the iconAnchor
        }
    });

    //define agency icons based on the base icon
    var tlcIcon = new baseIcon({ iconUrl: 'img/taxi.png' });
    var dotIcon = new baseIcon({ iconUrl: 'img/dot.png' });
    var parksIcon = new baseIcon({ iconUrl: 'img/parks.png' });
    var buildingsIcon = new baseIcon({ iconUrl: 'img/buildings.png' });
    var nypdIcon = new baseIcon({ iconUrl: 'img/nypd.png' });
    var dsnyIcon = new baseIcon({ iconUrl: 'img/dsny.png' });
    var fdnyIcon = new baseIcon({ iconUrl: 'img/fdny.png' });
    var doeIcon = new baseIcon({ iconUrl: 'img/doe.png' });
    var depIcon = new baseIcon({ iconUrl: 'img/dep.png' });
    var dofIcon = new baseIcon({ iconUrl: 'img/dof.png' });
    var dcaIcon = new baseIcon({ iconUrl: 'img/dca.png' });
    var dohmhIcon = new baseIcon({ iconUrl: 'img/dohmh.png' });
    var hpdIcon = new baseIcon({ iconUrl: 'img/hpd.png' });


    function getData() {
        //get map bounds from Leaflet
        var bbox = map.getBounds();
        //map.removeLayer(markers);
        markers.clearLayers();
        //create a SODA-ready bounding box that looks like: topLeftLat,topLeftLon,bottomRightLat,bottomRightLon
        var sodaQueryBox = [bbox._northEast.lat, bbox._southWest.lng, bbox._southWest.lat, bbox._northEast.lng];

        //figure out what the date was 7 days ago
        var sevenDaysAgo = new Date();
        //sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 21);

        $('#startDate').html(sevenDaysAgo.toDateString());

        function cleanDate(input) {
            return (input < 10) ? '0' + input : input;
        }

        //create a SODA-ready date string that looks like: 2014-11-01
        sevenDaysAgo = sevenDaysAgo.getFullYear()
			+ '-'
			+ cleanDate((sevenDaysAgo.getMonth() + 1))
			+ '-'
			+ cleanDate((sevenDaysAgo.getDate() + 1));

        //use jQuery's getJSON() to call the SODA API for NYC 311
        //concatenate sodaQueryBox and sevenDaysAgo to add a $where clause to the SODA endpoint
        $.getJSON(constructQuery(sevenDaysAgo, sodaQueryBox), function (data) {

                console.log(data)
			    //iterate over each 311 complaint, add a marker to the map
			    for (var i = 0; i < data.length; i++) {

			        var marker = data[i];
			        var icon = getIcon(marker);

			        var markerItem = L.marker([marker.location.latitude, marker.location.longitude], { icon: icon });
			        markerItem.bindPopup(
							'<h4>' + marker.issue_type + '</h4>'
							+ (new Date(marker.ticket_created_date_time)).toDateString() + '<br/>'
                            + marker.ticket_status
							+ ((marker.incident_address != null) ? '<br/>' + marker.incident_address : '')
						);
			        markers.addLayer(markerItem);
			    }
            //.addTo(map);
			    map.addLayer(markers);

			})
    }

    function constructQuery(sevenDaysAgo, sodaQueryBox) {
        //var originalstr = "https://data.cityofnewyork.us/resource/erm2-nwe9.json?$select=location,closed_date,complaint_type,street_name,created_date,status,unique_key,agency_name,due_date,descriptor,location_type,agency,incident_address&$where=created_date>'"
		var originalstr = "https://brigades.opendatanetwork.com/resource/dyik-sdjy.json?$select=location,ticket_closed_date_time,issue_type,ticket_created_date_time,ticket_status,ticket_id,issue_description&$where=ticket_created_date_time>'"
        	+ sevenDaysAgo
			+ "' AND within_box(location,"
			+ sodaQueryBox
			+ ")&$order=ticket_created_date_time desc"

        var agency = $( "#nycAgency" ).val();
        var conditiion = $("#conditions_list").val();
        if (agency.length != 0 && agency != "All") {
            originalstr = originalstr + "&issue_type=" + agency;
        }
        //if (conditiion.length != 0 && conditiion != "All") {
        //    originalstr = originalstr + "&complaint_type=" + conditiion;
        //}

        console.log(originalstr);

        return originalstr;
    }
    function getIcon(thisMarker) {

        switch (thisMarker.issue_type) {
            case 'Pothole':
                return tlcIcon;
            case 'Graffiti Removal':
                return dotIcon;
            case 'Sign Down':
                return parksIcon;
            case 'Sign Vandalized':
                return buildingsIcon;
            case 'Street Light Out':
                return nypdIcon;
            case 'Parks / Greenways':
                return dsnyIcon;
            case 'Traffic Signal Light Out':
                return fdnyIcon;
            case 'Sidewalks':
                return doeIcon;
            case 'Garbage / Recycling / Yard Waste':
                return depIcon;
            case 'Traffic Signal Malfuctioning':
                return dofIcon;
            case 'Vandalism Repair':
                return dcaIcon;
            case 'Vegetation Problem':
                return dohmhIcon;
            case 'Visual Obstruction':
                return hpdIcon;
            default:
                return new L.Icon.Default();
        }
    }

    map.on('dragend', function (e) {
        getData();
    });

    $('#nycAgency').on("change", function () {
        getData();
    });

    $("#conditions_list").on('change keyup paste', function () {
        getData();
    });
});
