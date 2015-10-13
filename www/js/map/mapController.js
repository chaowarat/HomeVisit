define(["app", "js/contactModel", "js/map/mapView"], function (app, Contact, View) {
    var contact = null;
    var state = {
        isNew: false
    };
    var isEdit = false;
    var bindings = [];
    var routeIndex = 0, legIndex = 0;
    var originText = '';
    var homeLatLong = null, map;

    function init(query) {
        app.f7.showIndicator();
        routeIndex = 0;
        isEdit = false;
        oldAnswer = null;
        var contacts = JSON.parse(localStorage.getItem("f7Contacts"));
        if (query && query.id) {
            contact = new Contact(_.find(contacts, { id: query.id }));
            state.isNew = false;
        }
        else {
            contact = new Contact({ isFavorite: query.isFavorite });
            state.isNew = true;
        }
        View.render({ model: contact, bindings: bindings, assessmentCallback: assessmentClick, infoCallback: infoClick });
        if (!app.isGetMap) {
            app.isGetMap = true;
            $.getScript('https://maps.googleapis.com/maps/api/js?v=3&?key=AIzaSyBDuskq2c_6ezrnB2W7Qa0FP6ykAooGxUc&sensor=false&callback=onMapsApiLoaded');
        }
        else {
            onMapsApiLoaded();
        }
    }

    function assessmentClick() {
        app.router.load('Form', { id: contact.id });
    }

    function infoClick() {
        console.log('info');
    }

    function onMapsApiLoaded() {        
        var _center = new google.maps.LatLng(16.745841, 100.19629); // bangkok
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                originText = 'ตำแหน่งปัจจุบัน';
                var mapOptions = {
                    zoom: 6,
                    center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                }                
                document.getElementById("map").innerHTML = null;
                map = new google.maps.Map(document.getElementById("map"), mapOptions);
                var directionsDisplay = new google.maps.DirectionsRenderer({
                    draggable: true,
                    map: map,
                    panel: document.getElementById('right-panel')
                });
                directionsDisplay.addListener('directions_changed', function () {
                    checkLocationChange(directionsDisplay.getDirections());
                });
                var directionsService = new google.maps.DirectionsService;
                directionsDisplay.setMap(map);
                calculateAndDisplayRoute(directionsService, directionsDisplay, mapOptions.center, new google.maps.LatLng(contact.lat, contact.long));
            },
            function (error) {
                alert(error.message);
            }, {
                enableHighAccuracy: true
                      , timeout: 5000
            });
        }
        else {
            var mapOptions = {
                zoom: 10,
                center: _center,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
            map = new google.maps.Map(document.getElementById("map"), mapOptions);
            var directionsDisplay = new google.maps.DirectionsRenderer({
                draggable: true,
                map: map,
                panel: document.getElementById('right-panel')
            });            
            var directionsService = new google.maps.DirectionsService;
            directionsDisplay.setMap(map);
            calculateAndDisplayRoute(directionsService, directionsDisplay, _center, new google.maps.LatLng(contact.lat, contact.long));
            directionsDisplay.addListener('directions_changed', function () {
                checkLocationChange(directionsDisplay.getDirections());
            });
        }
    }

    function checkLocationChange(newLocation) {
        if (!homeLatLong) {
            return;
        }        
        var destination = newLocation.routes[0].legs[0].end_location;
        if (originText != '') {
            destination.start_address = originText;
            destination.end_address = contact.firstName + ' ' + contact.lastName;
        }
        if (destination.G != homeLatLong.G || destination.K != homeLatLong.K) {
            alert(555666)

            homeLatLong = destination;            
        }
    }

    function mapDetail() {
        
    }

    function offsetCenter(latlng, offsetx, offsety) {
        var scale = Math.pow(2, map.getZoom());
        var nw = new google.maps.LatLng(
            map.getBounds().getNorthEast().lat(),
            map.getBounds().getSouthWest().lng()
        );
        var worldCoordinateCenter = map.getProjection().fromLatLngToPoint(latlng);
        var pixelOffset = new google.maps.Point((offsetx / scale) || 0, (offsety / scale) || 0)

        var worldCoordinateNewCenter = new google.maps.Point(
            worldCoordinateCenter.x - pixelOffset.x,
            worldCoordinateCenter.y + pixelOffset.y
        );
        var newCenter = map.getProjection().fromPointToLatLng(worldCoordinateNewCenter);
        map.setCenter(newCenter);
    }

    function handleLocationError(browserHasGeolocation, pos) {
        app.f7.hideIndicator();
        alert(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
    }

    function calculateAndDisplayRoute(directionsService, directionsDisplay, origin, destination) {
        directionsService.route({
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING
        }, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                homeLatLong = response.routes[0].legs[0].end_location;
                if (originText != '') {
                    response.routes[0].legs[0].start_address = originText;
                    response.routes[0].legs[0].end_address = contact.firstName + ' ' + contact.lastName;                    
                }
                var tmp = response.routes[routeIndex].legs[legIndex];
                View.setHeader(tmp.distance.text, tmp.duration.text);
                app.f7.hideIndicator();
                directionsDisplay.setDirections(response);
            } else {
                app.f7.hideIndicator();
                alert('Directions request failed due to ' + status);
            }
        });
    }

    function findValue(array, key) {
        for (var i = 0; i < array.length; i++) {
            if (Object.keys(array[i])[0] == key) {
                return array[i][key];
            }
        }
        return null;
    }

    function closePage() {
        app.f7.closeModal();
    }

    return {
        init: init,
        onMapsApiLoaded: onMapsApiLoaded
    };
});

function onMapsApiLoaded() {
    require(['js/map/mapController'], function (mapCtrl) {
        mapCtrl.onMapsApiLoaded();
    });
}