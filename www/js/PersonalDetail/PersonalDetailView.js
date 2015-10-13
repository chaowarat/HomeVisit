define(['app', 'js/contactModel', 'hbs!js/PersonalDetail/PersonalDetail'], function (app, Contact, Form) {
	var $ = Dom7;

	function render(params) {
	    var template = Form({ model: params.model, data: params.data });
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
		$('.close-Form').on('click', function () {
		    app.f7.closeModal('#personalDetailModal');
		});
	}

	return {
		render: render
	};
});