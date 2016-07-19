define(["app", "js/contactModel", "js/menu/menuView"], function (app, Contact, View) {
    var contact = null;
    var state = {
        isNew: false
    };
    var isEdit = false;
    var bindings = [{
        element: '.navbar-inner .left .back.link',
        event: 'click',
        handler: backClick
    }];

    function init(query) {
        app.f7.showIndicator();
        routeIndex = 0;
        isEdit = false;
        var contacts = JSON.parse(localStorage.getItem("f7Contacts"));
        if (query && query.id) {
            contact = new Contact(_.find(contacts, { id: query.id }));
            state.isNew = false;
        }
        else {
            contact = new Contact({ isFavorite: query.isFavorite });
            state.isNew = true;
        }
        View.render({ model: contact, bindings: bindings, assessmentCallback: assessmentClick, infoCallback: infoClick });
        app.f7.hideIndicator();
    }

    function assessmentClick() {
        app.router.load('Form', { id: contact.id });
    }

    function infoClick() {
        app.router.load('PersonalDetail', { id: contact.id });
    }

    function backClick() {
        app.router.load('list');
        closePage();
    }

    function closePage() {
        app.f7.closeModal();
    }

    return {
        init: init
    };
});
