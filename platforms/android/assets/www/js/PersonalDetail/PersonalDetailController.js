define(["app", "js/contactModel", "js/PersonalDetail/PersonalDetailView"], function (app, Contact, View) {
	var contact = null;
	var state = {
		isNew: false
	};
	var oldAnswer = null;
	var bindings = [{
		element: '.contact-delete-button',
		event: 'click',
		handler: deleteContact
	}];

	function init(query) {
	    var contacts = JSON.parse(localStorage.getItem("f7Contacts"));
	    if (query && query.id) {
	        contact = new Contact(_.find(contacts, { id: query.id }));
	        state.isNew = false;
	    }
	    else {
	        contact = new Contact({ isFavorite: query.isFavorite });
	        state.isNew = true;
	    }
	    View.render({ model: contact, bindings: bindings, data: null });
	}

	function deleteContact() {
		app.f7.actions([[{
			text: 'ยืนยันการลบ',
			red: true,
			onClick: function() {
				var contacts = JSON.parse(localStorage.getItem("f7Contacts"));
				_.remove(contacts, { id: contact.id });
				localStorage.setItem("f7Contacts", JSON.stringify(contacts));
				closePage();
				app.router.load('list'); // reRender main page view
				app.mainView.goBack("index.html", false);
				
			}
		}], [{
			text: 'ยกเลิก',
			bold: true
		}]]);
	}

	function closePage() {
	    app.f7.closeModal();
	}

	return {
		init: init
	};
});