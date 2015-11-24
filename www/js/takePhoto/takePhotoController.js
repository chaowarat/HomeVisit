define(["app", "js/contactModel", "js/takePhoto/takePhotoView"], function (app, Contact, View) {
	var contact = null;
	var state = {
		isNew: false
	};
	var isEdit = false;
	var bindings = [{
	    element: '.upload-img',
	    event: 'click',
	    handler: uploadImg
	}];
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

	function uploadImg() {
	    // upload image
	    app.f7.showIndicator();
	    uploadHomeImg();
	}

	function convertToDataURLviaCanvas(url, callback, outputFormat) {
	    var img = new Image();
	    //img.crossOrigin = 'Anonymous';
	    img.onload = function () {
	        var canvas = document.createElement('CANVAS');
	        var ctx = canvas.getContext('2d');
	        var dataURL;
	        canvas.height = 600;
	        canvas.width = 600;
	        ctx.drawImage(this, 0, 0);
	        dataURL = canvas.toDataURL(outputFormat);
	        callback(dataURL);
	        canvas = null;
	    };
	    img.src = url;
	}

	function uploadHomeImg() {	    
	    var image = document.getElementById('imgHome');
	    if (image.getAttribute('src').length <= 0) {
	        app.f7.hideIndicator(); return;
	    }
	    convertToDataURLviaCanvas(image.getAttribute('src'), function (base64Img) {
	        var memo = JSON.parse(localStorage.getItem("memo"));
	        if (!memo['0'] || !memo['1']) {
	            return;
	        }
	        var _data = {};
	        _data['USERNAME'] = app.utils.Base64.decode(memo['0']);
	        _data['PASSWORD'] = app.utils.Base64.decode(memo['1']);
	        _data['fileName'] = contact.CID + 'home';
	        _data['path'] = 'homevisit';
	        _data['imgData'] = base64Img.split('base64,')[1];
	        console.log('json=' + encodeURIComponent(JSON.stringify(_data)));
	        var _url = 'http://private-edu.azurewebsites.net/webservices/getservice.svc/saveImage';
	        Dom7.ajax({
	            url: _url,
	            method: 'POST',
	            data: 'json=' + encodeURIComponent(JSON.stringify(_data)),
	            contentType: "application/x-www-form-urlencoded",
	            success: function (msg) {
                    console.log('-----------------------------------------------------')
                    _data = {};
                    uploadFamilyImg();
	            },
	            error: function (error) {
	                console.log(error);
	                app.f7.hideIndicator();
	                app.f7.alert(error.statusText + ' โปรดติดต่อผู้ดูแลระบบ');	                
	            }
	        });
	    });
	}

	function uploadFamilyImg() {
	    var image = document.getElementById('imgFamily');
	    if (image.getAttribute('src').length <= 0) {
	        app.f7.hideIndicator(); return;
	    }
	    convertToDataURLviaCanvas(image.getAttribute('src'), function (base64Img) {
	        var memo = JSON.parse(localStorage.getItem("memo"));
	        if (!memo['0'] || !memo['1']) {
	            return;
	        }
	        var _data = {};
	        _data['USERNAME'] = app.utils.Base64.decode(memo['0']);
	        _data['PASSWORD'] = app.utils.Base64.decode(memo['1']);
	        _data['fileName'] = contact.CID + 'family';
	        _data['path'] = 'homevisit';
	        _data['imgData'] = base64Img.split('base64,')[1];
	        console.log('json=' + encodeURIComponent(JSON.stringify(_data)));
	        var _url = 'http://private-edu.azurewebsites.net/webservices/getservice.svc/saveImage';
	        Dom7.ajax({
	            url: _url,
	            method: 'POST',
	            data: 'json=' + encodeURIComponent(JSON.stringify(_data)),
	            contentType: "application/x-www-form-urlencoded",
	            success: function (msg) {
	                console.log('-----------------------------------------------------')
	                _data = {};
	                app.f7.hideIndicator();
	            },
	            error: function (error) {
	                console.log(error);
	                app.f7.hideIndicator();
	                app.f7.alert(error.statusText + ' โปรดติดต่อผู้ดูแลระบบ');
	            }
	        });
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
	        quality: 60,
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
	    init: init
	};
});
