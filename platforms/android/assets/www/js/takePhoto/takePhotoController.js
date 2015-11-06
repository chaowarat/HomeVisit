define(["app", "js/contactModel", "js/takePhoto/takePhotoView"], function (app, Contact, View) {
	var contact = null;
	var state = {
		isNew: false
	};
	var isEdit = false;
	var bindings = [];
	var pictureSource, destinationType;
	var cameraPopoverHandle, isTakePhoto = true, isHome = true;

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
	    View.render({
	        model: contact, bindings: bindings,
	        homePhotoCallback: homePhoto, homeLibraryCallback: homeLibrary,
	        familyPhotoCallback: familyPhoto, familyLibraryCallback: familyLibrary
	    });
	}	

	function getPhoto() {
	    cameraPopoverHandle = navigator.camera.getPicture(onSuccess, onFail,
         {
             destinationType: Camera.DestinationType.FILE_URI,
             sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
             popoverOptions: new CameraPopoverOptions(300, 300, 200, 200, Camera.PopoverArrowDirection.ARROW_ANY)
         });
	}
	function onSuccess(u) {
	    var image = document.getElementById('imgHome');
	    if (!isHome) {
	        image = document.getElementById('imgFamily');
	    }
	    image.src = u;
	}
	function onFail(e) {
	    console.log('onFail');
	    console.dir(e);
	}

	function takePhoto() {
	    navigator.camera.getPicture(picOnSuccess, picOnFailure, {
	        quality: 100,
	        destinationType: Camera.DestinationType.FILE_URI,
	        sourceType: Camera.PictureSourceType.CAMERA,
	        correctOrientation: true
	    });
	}
	function picOnSuccess(imageURI) {
	    var image = document.getElementById('imgHome');
	    if (!isHome) {
	        image = document.getElementById('imgFamily');
	    }
	    image.src = imageURI;
	    //image.src = "data:image/jpeg;base64," + imageData;
	}
	function picOnFailure(message) {
	    console.log(message)
	    //alert('Failed because: ' + message);
	}

	function homePhoto() {
	    isTakePhoto = true; isHome = true;
	    takePhoto();
	}
	function homeLibrary() {
	    isTakePhoto = false; isHome = true;
	    getPhoto();
	}
	function familyPhoto() {
	    isTakePhoto = true; isHome = false;
	    takePhoto();
	}
	function familyLibrary() {
	    isTakePhoto = false; isHome = false;
	    getPhoto();
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