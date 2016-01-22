define(['app', 'js/contactModel', 'hbs!js/map/map'], function (app, Contact, dailyForm) {
    var $ = Dom7;
    var contact;

    function render(params) {
        contact = params.model;
	    var template = dailyForm({ model: params.model });
		app.f7.popup(template);
		bindEvents(params.bindings);
		bindUIEvent(params.saveAddressHandle);
	}

	function bindEvents(bindings) {
		for (var i in bindings) {
			$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
		}
	}

	function bindUIEvent(saveAddressHandle) {
	    $('.close-map').on('click', function () {
	        app.f7.closeModal('#mapModal');
	    });
	    $('.edit-address-link').on('click', function () {
	        app.f7.popover('.popover-address', this);
            $('#popover_houseNumber').val(contact.houseNumber);
            $('#popover_mooNumber').val(contact.mooNumber);
            $('#popover_postCode').val(contact.postCode);
	    });
	    $('.save-address-button').on('click', function () {
	        saveAddressHandle($('#popover_houseNumber').val(), $('#popover_mooNumber').val(), $('#popover_postCode').val());
	        app.f7.closeModal('.popover-address');
	    });
	}

	function setHeader(distance, duration) {
	    $('#mapTitle').text(distance + '(' + duration + ')');
	}

	return {
	    render: render,
	    setHeader: setHeader
	};
});