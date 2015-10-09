define(['app', 'js/contactModel', 'hbs!js/takePhoto/takePhoto'], function (app, Contact, dailyForm) {
	var $ = Dom7;

	function render(params) {
	    var template = dailyForm({ model: params.model });
		app.f7.popup(template);
		bindEvents(params.bindings);
		bindUIEvent(params.assessmentCallback, params.infoCallback);
	}

	function bindEvents(bindings) {
		for (var i in bindings) {
			$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
		}
	}

	function bindUIEvent(homePhotoCallbackCallback, infoCallback) {
	    $('.button-homePhoto').on('click', function () {
	        homePhotoCallback();
	    });
	    $('.button-showInfo').on('click', function () {
	        infoCallback();
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