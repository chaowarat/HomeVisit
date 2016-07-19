cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/org.apache.cordova.camera/www/CameraConstants.js",
        "id": "org.apache.cordova.camera.Camera",
        "pluginId": "org.apache.cordova.camera",
        "clobbers": [
            "Camera"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.camera/www/CameraPopoverOptions.js",
        "id": "org.apache.cordova.camera.CameraPopoverOptions",
        "pluginId": "org.apache.cordova.camera",
        "clobbers": [
            "CameraPopoverOptions"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.camera/www/Camera.js",
        "id": "org.apache.cordova.camera.camera",
        "pluginId": "org.apache.cordova.camera",
        "clobbers": [
            "navigator.camera"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.camera/src/browser/CameraProxy.js",
        "id": "org.apache.cordova.camera.CameraProxy",
        "pluginId": "org.apache.cordova.camera",
        "runs": true
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.0.0",
    "org.apache.cordova.camera": "0.3.6",
    "org.apache.cordova.geolocation": "0.3.12"
}
// BOTTOM OF METADATA
});