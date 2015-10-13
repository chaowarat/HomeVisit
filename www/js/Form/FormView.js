define(['app', 'js/contactModel', 'hbs!js/Form/Form'], function (app, Contact, Form) {
	var $ = Dom7;

	function render(params) {
	    var template = Form({ model: params.model, state: params.state, data: params.data });
		app.f7.popup(template);
		bindEvents(params.bindings);
		bindSaveEvent(params.doneCallback);
	}

	function bindEvents(bindings) {
		for (var i in bindings) {
			$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
		}
	}

	function bindSaveEvent(doneCallback) {
		$('.contact-save-link').on('click', function() {
			var inputValues = $('.contact-edit-form input');
			doneCallback(inputValues);
		});
		$('.close-Form').on('click', function () {
		    app.f7.closeModal('#formModal');
		});
	}

	return {
		render: render
	};
});