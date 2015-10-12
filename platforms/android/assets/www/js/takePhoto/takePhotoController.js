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

	var cameraPopoverHandle;

	function startCamera() {

	    cameraPopoverHandle = navigator.camera.getPicture(onSuccess, onFail,
         {
             destinationType: Camera.DestinationType.FILE_URI,
             sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
             popoverOptions: new CameraPopoverOptions(300, 300, 200, 200, Camera.PopoverArrowDirection.ARROW_ANY)
         });

	}

	function onSuccess(u) {
	    console.log('onSuccess');
	    document.querySelector("#canvas").src = u;
	}

	function onFail(e) {
	    console.log('onFail');
	    console.dir(e);
	}

	function homePhoto() {
	    navigator.camera.getPicture(picOnSuccess, picOnFailure, {
	        quality: 20,
	        destinationType: Camera.DestinationType.DATA_URL,
	        sourceType: Camera.PictureSourceType.CAMERA,
	        correctOrientation: true
	    });
	}

	function getPhoto() {
        console.log(555)
	    navigator.camera.getPicture(picOnSuccess, picOnFailure, {
	        destinationType: Camera.DestinationType.FILE_URI,
	        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
	        popoverOptions: new CameraPopoverOptions(300, 300, 200, 200, Camera.PopoverArrowDirection.ARROW_ANY),
	        correctOrientation: true
	    });
	}

	function picOnSuccess(imageData) {
	    console.log(imageData)
	    var image = document.getElementById('cameraPic');
	    image.src = imageData;
	    sPicData = imageData; //store image data in a variable
	}

	function picOnFailure(message) {
	    console.log(message)
	    alert('Failed because: ' + message);
	}

	function infoClick() {
	    console.log('info');
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
        alert('loaded map');
        mapCtrl.onMapsApiLoaded();
    });
}