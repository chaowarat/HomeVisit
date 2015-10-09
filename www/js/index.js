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
    receivedEvent: function(id) {
        //pictureSource=navigator.camera.PictureSourceType;
        console.log(555)
        //destinationType=navigator.camera.DestinationType;
        console.log(navigator.camera)
    }
};

