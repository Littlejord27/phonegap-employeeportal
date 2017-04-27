// Initialize app
var myApp = new Framework7();
// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var isAndroid = Framework7.prototype.device.android === true;
var isIos = Framework7.prototype.device.ios === true;
var isBrowser = (!isAndroid & !isIos) ? true : false;

/*
Template7.global = {
    android: isAndroid,
    ios: isIos
};
{{#if @global.android}}
*/

// Add view
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});

myApp.onPageInit('pos_cart', function (page) {
    allPoSPageInit();

    $$('.button-scan').on('click', startScan);

    function startScan(){
        cloudSky.zBar.scan(
            {
                text_title: "Bedrooms and More", // Android only
                text_instructions: "Scan Product QR Code", // Android only
                camera: "back", // defaults to "back"
                flash: "auto", // defaults to "auto". See Quirks
                drawSight: true //defaults to true, create a red sight/line in the center of the scanner view.
            },
            function(result) { //index of where it starts
                console.log(result);
            }
        );
    }
});

/*
**
** Point of Sale
** All Pages
*/
function allPoSPageInit(){

}