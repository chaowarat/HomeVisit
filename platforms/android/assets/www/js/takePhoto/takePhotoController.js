define(["app", "js/contactModel", "js/takePhoto/takePhotoView"], function (app, Contact, View) {
    var contact = null;
    var blobUrl = 'http://nuqlis.blob.core.windows.net/homevisit/';
	var state = {
		isNew: false
	};
	var isEdit = false;
	var bindings = [{
	    element: '.button-home-upload',
	    event: 'click',
	    handler: uploadHomeImg
	},
	{
	    element: '.button-family-upload',
	    event: 'click',
	    handler: uploadFamilyImg
	}];
	var pictureSource, destinationType;
	var cameraPopoverHandle, isTakePhoto = true, isHome = true;
	var urlEdu = 'http://alphaedu.azurewebsites.net/webservices/getservice.svc/';

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
	    contact['imgHome'] = blobUrl + contact.CID + 'home' + (new Date()).getFullYear() + '?' + (new Date().getTime());
	    contact['imgFamily'] = blobUrl + contact.CID + 'family' + (new Date()).getFullYear() + '?' + (new Date().getTime());
	    View.render({
	        model: contact, bindings: bindings,
	        homePhotoCallback: homePhoto, homeLibraryCallback: homeLibrary,
	        familyPhotoCallback: familyPhoto, familyLibraryCallback: familyLibrary
	    });
	}

	function convertToDataURLviaCanvas(url, callback, outputFormat) {
	    var img = new Image();
	    //img.crossOrigin = 'Anonymous';
	    img.onload = function () {
	        var canvas = document.createElement('CANVAS');
	        var ctx = canvas.getContext('2d');
	        var dataURL;
	        var ratio = this.height / 600;
	        canvas.height = this.height / ratio;
	        canvas.width = this.width / ratio;
	        ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, this.width / ratio, this.height / ratio);
	        dataURL = canvas.toDataURL(outputFormat);
	        callback(dataURL);
	        canvas = null;
	    };
	    img.src = url;
	}

	function uploadHomeImg() {
	    if (!navigator.onLine) {
	        app.f7.alert('ไม่สามารถเชื่อมต่ออินเตอร์เน็ตได้ โปรดตรวจสอบการตั้งค่า');
	        return;
	    }
	    app.f7.showIndicator();
	    var image = document.getElementById('imgHome');
	    if (image.getAttribute('src').length <= 0) {
	        app.f7.hideIndicator(); return;
	    }
	    convertToDataURLviaCanvas(image.getAttribute('src'), function (base64Img) {
	        var memo = JSON.parse(localStorage.getItem("memo"));
	        if (!memo['0'] || !memo['1']) {
	            app.f7.hideIndicator(); return;
	        }
	        var _data = {};
	        _data['USERNAME'] = app.utils.Base64.decode(memo['0']);
	        _data['PASSWORD'] = app.utils.Base64.decode(memo['1']);
	        _data['fileName'] = contact.CID + 'home';
	        _data['path'] = 'homevisit';
	        console.log('json=' + encodeURIComponent(JSON.stringify(_data)));
	        var _url = urlEdu + 'saveImage';
	        Dom7.ajax({
	            url: _url,
	            method: 'POST',
	            data: 'json=' + encodeURIComponent(JSON.stringify(_data)) + ';imageData=' + encodeURIComponent(base64Img.split('base64,')[1]),
	            contentType: "application/x-www-form-urlencoded",
	            success: function (msg) {
	                var response = JSON.parse(JSON.parse(msg));
	                if (response.status.toLowerCase() == 'ok') {
	                    app.f7.hideIndicator();
	                    app.f7.alert('อัพโหลดรูปบ้านแล้ว', 'อัพโหลด');
	                }
	                else {
	                    app.f7.hideIndicator();
	                    app.f7.alert(response.errorMessage, 'ERROR');
	                }
	            },
	            error: function (error) {
	                app.f7.hideIndicator();
	                app.f7.alert(error.statusText + ' โปรดติดต่อผู้ดูแลระบบ');
	            }
	        });
	    });
	}

	function uploadFamilyImg() {
	    if (!navigator.onLine) {
	        app.f7.alert('ไม่สามารถเชื่อมต่ออินเตอร์เน็ตได้ โปรดตรวจสอบการตั้งค่า');
	        return;
	    }
	    app.f7.showIndicator();
	    var image = document.getElementById('imgFamily');
	    if (image.getAttribute('src').length <= 0) {
	        app.f7.hideIndicator(); return;
	    }
	    convertToDataURLviaCanvas(image.getAttribute('src'), function (base64Img) {
	        var memo = JSON.parse(localStorage.getItem("memo"));
	        if (!memo['0'] || !memo['1']) {
	            app.f7.hideIndicator(); return;
	        }
	        var _data = {};
	        _data['USERNAME'] = app.utils.Base64.decode(memo['0']);
	        _data['PASSWORD'] = app.utils.Base64.decode(memo['1']);
	        _data['fileName'] = contact.CID + 'family';
	        _data['path'] = 'homevisit';
	        console.log('json=' + encodeURIComponent(JSON.stringify(_data)));
	        var _url = urlEdu + 'saveImage';
	        Dom7.ajax({
	            url: _url,
	            method: 'POST',
	            data: 'json=' + encodeURIComponent(JSON.stringify(_data)) + ';imageData=' + encodeURIComponent(base64Img.split('base64,')[1]),
	            contentType: "application/x-www-form-urlencoded",
	            success: function (msg) {
	                var response = JSON.parse(JSON.parse(msg));
	                if (response.status.toLowerCase() == 'ok') {
	                    app.f7.hideIndicator();
	                    app.f7.alert('อัพโหลดรูปครอบครัวแล้ว', 'อัพโหลด');
	                }
	                else {
	                    app.f7.hideIndicator();
	                    app.f7.alert(response.errorMessage, 'ERROR');
	                }
	            },
	            error: function (error) {
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
