define(['app', 'js/contactModel', 'hbs!js/takePhoto/takePhoto'], function (app, Contact, dailyForm) {
	var $ = Dom7;

	function render(params) {
	    var template = dailyForm({ model: params.model });
		app.f7.popup(template);
		bindEvents(params.bindings);
		bindUIEvent(params.homePhotoCallback, params.homeLibraryCallback, params.familyPhotoCallback, params.familyLibraryCallback);
	}

	function bindEvents(bindings) {
		for (var i in bindings) {
			$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
		}
	}

	function bindUIEvent(homePhotoCallback, homeLibraryCallback, familyPhotoCallback, familyLibraryCallback) {
	    $('.button-home-photo').on('click', function () {
	        homePhotoCallback();
	    });
	    $('.button-home-library').on('click', function () {
	        homeLibraryCallback();
	    });

	    $('.button-family-photo').on('click', function () {
	        familyPhotoCallback();
	    });
	    $('.button-family-library').on('click', function () {
	        familyLibraryCallback();
	    });

	    $('.close-takePhoto').on('click', function () {
	        app.f7.closeModal('#takePhotoModal');
	    });
	}

	function setHeader(distance, duration) {
	    $('#mapTitle').text('กลับ ' + distance + ' (' + duration + ')');
	}

	return {
	    render: render,
	    setHeader: setHeader
	};
});