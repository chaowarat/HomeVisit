define(["app", "js/contactModel", "js/map/mapView"], function (app, Contact, View) {
    var contact = null;
    var state = {
        isNew: false
    };
    var isEdit = false;
    var bindings = [];
    var routeIndex = 0, legIndex = 0;
    var originText = '';

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
                var directionsDisplay = new google.maps.DirectionsRenderer;
                var directionsService = new google.maps.DirectionsService;
                document.getElementById("map").innerHTML = null;
                var map = new google.maps.Map(document.getElementById("map"), mapOptions);
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
            var directionsDisplay = new google.maps.DirectionsRenderer;
            var directionsService = new google.maps.DirectionsService;
            var map = new google.maps.Map(document.getElementById("map"), mapOptions);
            directionsDisplay.setMap(map);
            calculateAndDisplayRoute(directionsService, directionsDisplay, _center, new google.maps.LatLng(contact.lat, contact.long));
        }
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
                if (originText != '') {
                    for (var i = 0; i < response.routes.length; i++) {
                        for (var j = 0; j < response.routes[i].legs.length; j++) {
                            response.routes[i].legs[j].start_address = originText;
                            response.routes[i].legs[j].end_address = contact.firstName + ' ' + contact.lastName;
                        }
                    }
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