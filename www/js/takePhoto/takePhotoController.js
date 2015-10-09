define(["app", "js/contactModel", "js/takePhoto/takePhotoView"], function (app, Contact, View) {
	var contact = null;
	var state = {
		isNew: false
	};
	var isEdit = false;
	var bindings = [];
	var pictureSource;   // picture source
	var destinationType; // sets the format of returned value

	function init(query) {
	    pictureSource = navigator.camera.PictureSourceType;
	    destinationType = navigator.camera.DestinationType;

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
	    View.render({ model: contact, bindings: bindings, homePhotoCallback: homePhoto, infoCallback: infoClick });
	}

	function capturePhoto() {
	    navigator.camera.getPicture(picOnSuccess, picOnFailure, {
	        quality: 20,
	        destinationType: Camera.DestinationType.DATA_URL,
	        sourceType: Camera.PictureSourceType.CAMERA,
	        correctOrientation: true
	    });
	}

	function getPhoto() {
	    navigator.camera.getPicture(picOnSuccess, picOnFailure, {
	        quality: 20,
	        destinationType: Camera.DestinationType.DATA_URL,
	        sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
	        correctOrientation: true
	    });
	}

	function picOnSuccess(imageData) {

	    var image = document.getElementById('cameraPic');
	    image.src = imageData;
	    sPicData = imageData; //store image data in a variable
	}

	function picOnFailure(message) {
	    alert('Failed because: ' + message);
	}

	function homePhoto() {
	    console.log('assessment');
	}

	function infoClick() {
	    console.log('info');
	}

	function closePage() {
	    app.f7.closeModal("takePhotoPanel");
	}

	return {
	    init: init,
	    onMapsApiLoaded: onMapsApiLoaded
	};
});

function onMapsApiLoaded() {
    require(['js/map/mapController'], function(mapCtrl) {
        mapCtrl.onMapsApiLoaded();
    });
}