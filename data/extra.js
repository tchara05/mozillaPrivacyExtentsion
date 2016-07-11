var store = null;

/**
 * Listener which listens to main panel message and gets the
 * add on storage.
 *
 * If add-on storage has no values then initailizes these values
 */
self.on('message', function(ss) {

    ss.storage.setValue = function (key, value) {
        self.postMessage({
             method: 'setValue',
            'key': key,
            'value': value
        });
    };
    store =ss;
    ss.storage.getValue=function (key){
        return ss.storage[key];
    };

    if (!ss.storage.hasOwnProperty("user-settings")){
        store.storage.setValue("user-settings",{});
    }
    if (!ss.storage.hasOwnProperty("user-advance-settings")){
        store.storage.setValue("user-advance-settings",{});
    }
    if (!ss.storage.hasOwnProperty("user-group-settings")){
        store.storage.setValue("user-group-settings",{});
    }

});




var HARDWARE_SUPPORTED ={"geolocation":"geolocation","battery":"battery",
                         "onLine":"onLine","vibrate":"vibrate",
                         "mediaDevices":"mediaDevices", "oscpu":"oscpu",
                         "mozContact":"mozContact",
                         "deviceorientation": "deviceorientation",
                         "orientationchange": "orientationchange",
                          "devicelight":"devicelight","userproximity":"userproximity",
                         "notification":"notification","indexedDB":"indexedDB",
                         "powerManger":"powerManager"};


/***********************************************
 *                                             *
 * Events for buttons and all other elements   *
 *                                             *
 *                                             *
 ***********************************************/

$("#settings-button").on("click",restoreUserSettings);

$(".k").on("click",function () {
    $(".internal").collapse("hide");
    if ($(this).hasClass("active-hover")){
        $(".k").removeClass("active-hover");
    } else{
        $(".k").removeClass("active-hover");
        $(this).addClass("active-hover");
        $("#"+$(this).href).collapse("show");
    }
});



$("#dev .list-group .list-group-item").on("click",function(){
    setTimeout(takeUserSettings,100);
});
$("#comm .list-group .list-group-item").on("click",function(){
    setTimeout(takeUserSettings,100);
});

$("#dataa .list-group .list-group-item").on("click",function(){
    setTimeout(takeUserSettings,100);
});
$("#advance-page").on("click",function (){
      setTimeout(sendMes,100);
});


/**
 *
 * Function that collect or values from toggles buttons
 * and sents them for save
 *
 **/

function takeUserSettings() {
    var userOption = {};
    for (var i in  HARDWARE_SUPPORTED) {
        userOption[HARDWARE_SUPPORTED[i]] = document.getElementById(HARDWARE_SUPPORTED[i]).checked;
    }
    saveUserSettings(userOption);
}


/**
 * Function that saves user-settings to store
 *
 * @param settings
 */

function saveUserSettings(settings){
    store.storage.setValue("user-settings",JSON.stringify(settings));
}


/**
 * Function that takes user-settings from store
 * and make them visible to main panel
 *
 */

function restoreUserSettings(){
    var userOptions =JSON.parse(store.storage["user-settings"]);
    for (var key in userOptions){
        if (userOptions[key]===true){
            $("#"+HARDWARE_SUPPORTED[key]).bootstrapToggle('on');
        }else{
            userOptions[key].checked=false;
            $("#"+HARDWARE_SUPPORTED[key]).bootstrapToggle('off');
        }
    }
}


/** Function That send messages to main panel to open the advance panel
 * for advance settings
 *
 */
function sendMes(){
    self.postMessage({method:"advance"});
}


