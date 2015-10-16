define(['app', 'js/contactModel', 'hbs!js/map/map'], function (app, Contact, dailyForm) {
    var $ = Dom7;
    var contact;

    function render(params) {
        contact = params.model;
	    var template = dailyForm({ model: params.model });
		app.f7.popup(template);
		bindEvents(params.bindings);
		bindUIEvent();
	}

	function bindEvents(bindings) {
		for (var i in bindings) {
			$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
		}
	}

	function bindUIEvent() {
	    $('.close-map').on('click', function () {
	        app.f7.closeModal('#mapModal');
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