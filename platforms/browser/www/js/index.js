var appIndex = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        appIndex.receivedEvent('deviceready');
    },
    receivedEvent: function (id) {

    }
};


