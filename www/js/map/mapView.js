define(['app', 'js/contactModel', 'hbs!js/map/map'], function (app, Contact, dailyForm) {
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

	function bindUIEvent(assessmentCallback, infoCallback) {
	    $('.button-assessment').on('click', function () {
			assessmentCallback();
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