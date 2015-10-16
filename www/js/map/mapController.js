define(["app", "js/contactModel", "js/map/mapView"], function (app, Contact, View) {
    var contact = null;
    var state = {
        isNew: false
    };
    var isEdit = false;
    var bindings = [];
    var routeIndex = 0, legIndex = 0;
    var originText = '';
    var homeLatLong = null, map, destination = null;

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
        View.render({ model: contact, bindings: bindings });
        if (!app.isGetMap) {
            app.isGetMap = true;
            $.getScript('https://maps.googleapis.com/maps/api/js?v=3&?key=AIzaSyBDuskq2c_6ezrnB2W7Qa0FP6ykAooGxUc&sensor=false&callback=onMapsApiLoaded');
        }
        else {
            onMapsApiLoaded();
        }
    }

    function onMapsApiLoaded() {
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
                app.f7.hideIndicator();
                app.f7.pickerModal('.picker-info');
                directionByDefault();
            }, {
                enableHighAccuracy: true
                      , timeout: 5000
            });
        }
        else {
            directionByDefault();
        }
    }

    function directionByDefault() {
        var _center = new google.maps.LatLng(16.745841, 100.19629); // bangkok
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

    function checkLocationChange(newLocation) {
        if (!homeLatLong) {
            return;
        }
        destination = newLocation.routes[0].legs[0].end_location;
        if (originText != '') {
            destination.start_address = originText;
            destination.end_address = contact.firstName + ' ' + contact.lastName;
        }
        if (destination.G != homeLatLong.G || destination.K != homeLatLong.K) {            
            var buttons = [
                {
                    text: 'บันทึกตำแหน่งของที่อยู่ใหม่',
                    bold: true,
                    onClick: function () {
                        homeLatLong = destination;
                        contact.lat = homeLatLong.G;
                        contact.long = homeLatLong.K;
                        var contacts = JSON.parse(localStorage.getItem("f7Contacts"));
                        for (var i = 0; i < contacts.length; i++) {
                            if (contacts[i].id == contact.id) {
                                contacts[i] = contact;
                            }
                        }
                        localStorage.setItem("f7Contacts", JSON.stringify(contacts));
                    }
                },
                {
                    text: 'ยกเลิก'
                }
            ];
            app.f7.actions(buttons);
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
                homeLatLong = response.routes[0].legs[0].end_location;
                if (originText != '') {
                    response.routes[0].legs[0].start_address = originText;
                    response.routes[0].legs[0].end_address = contact.firstName + ' ' + contact.lastName;
                }
                var tmp = response.routes[routeIndex].legs[legIndex];
                View.setHeader(tmp.distance.text.replace('km', 'กม.'), tmp.duration.text.replace('hours', 'ชม.').replace('mins', 'นาที'));
                app.f7.hideIndicator();
                directionsDisplay.setDirections(response);
            } else {
                app.f7.hideIndicator();
                alert('Directions request failed due to ' + status);
            }
        });
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