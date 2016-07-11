var userSets = {};
var pageName=window.location.href;
if (!localStorage.hasOwnProperty("page-name")) {
    self.port.on('message', function (ss) {
        if (isEmpty(ss.storage)){
            load();
            return;
        }
        if ( !isEmpty(ss.storage["user-advance-settings"])){
            console.log("in advance");
           userSets = checkForAdvance(ss.storage["user-advance-settings"]);
        }
        if (isEmpty(userSets)&&!isEmpty(ss.storage["user-group-settings"])){
            console.log(" in groups");
            userSets = checkForGroups(ss.storage["user-group-settings"]);
        }
        if (isEmpty(userSets) && !isEmpty(ss.storage["user-advance-settings"]) && ss.storage["user-advance-settings"].hasOwnProperty("Override Default Settings")){
            console.log("in general");
            userSets = ovveride(ss.storage["user-advance-settings"]["Override Default Settings"]);

        }
        if (isEmpty(userSets)){
            if (!isEmpty(ss.storage["user-settings"])) {
                userSets =JSON.parse(ss.storage["user-settings"]);
                console.log("in simple");
            } else {
                userSets = {};
            }
        }

        if (!isEmpty(userSets)) {
            userSets = JSON.stringify(userSets);
            localStorage.setItem("user-settings", userSets);

        }
        load();
    });
    localStorage.setItem("page-name",pageName);
    window.stop();
}else{
    if(localStorage.hasOwnProperty("user-settings")) {
        createUserSettingsDeleteElement();
        deleteUserSettingsEvents();
    }
    localStorage.removeItem("user-settings");
    localStorage.removeItem("page-name");
}


function load(){
    window.location.href = localStorage.getItem("page-name");

}

function ovveride(settings){
    var DAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    var today = DAYS[new Date().getDay()];
    var sets = createUserSettings(settings[today]);
    return sets;
}

function createUserSettingsDeleteElement(){
    var myScript = top.window.document.createElement('script');
    userSets = localStorage.getItem("user-settings");
    myScript.type = 'text/javascript';
    myScript.id="navigator";
    console.log(userSets);
    myScript.innerHTML = 'console.log("deleting"); var userSettings;' +
    'var nav=navigator; ' +
    'delete window.navigator;' +
    'window.navigator = {};' +
    'userSettings ='+userSets+';'  +
    '' +
    'console.log(userSettings);' +
    '' +
    'for (var navkey in nav){' +
    '' +
    '   if (userSettings.hasOwnProperty(navkey) && userSettings[navkey]==false){' +
    '' +
    '       continue;' +
    '   }else if(navkey=="mozContacts") {' +
    '      if (userSettings["mozContact"]==false){' +
    '       continue;' +
    '      }else{' +
    '          window.navigator["mozContacts"]=nav["mozContacts"]; ' +
    '      }'+
    ' }else{ '+
    '       window.navigator[navkey]=nav[navkey];' +
    '   }'+
    '}' +
    'if(userSettings.hasOwnProperty("indexedDB") && userSettings["indexedDB"]==false){' +
    '   delete indexedDB;' +
    '}' +
    'if(userSettings.hasOwnProperty("notification") && userSettings["notification"]==false){' +
    '   delete Notification;' +
    '   delete DesktopNotification' +
    '}' +
    'if(userSettings.hasOwnProperty("mozContact") && userSettings["mozContact"]==false){' +
    '   mozContact=null;' +
    '   delete mozContact;'+
    '   MozContactChangeEvent=null;' +
    '' +
    '' +
    '}' +
    'if(userSettings.hasOwnProperty("webSMS") && userSettings["webSMS"]==false){' +
    '   MozSmsMessage=null;' +
    '' +
    '}' +
    'if(userSettings.hasOwnProperty("webMMS") && userSettings["webMMS"]==false){' +
    '   MozMmsMessage=null;' +
    '' +
    '}' +
    'if(userSettings.hasOwnProperty("powerManager") && userSettings["powerManager"]==false){' +
    '   MozPowerManager=null;' +
    '   delete MozPowerManager;' +
    '}' +
    '' +
    '';
    top.window.content.document.getElementsByTagName('html')[0].insertBefore(myScript, document.getElementsByTagName("head")[0]);
}

function deleteUserSettingsEvents(){
    var mySecondScript =top.window.content.document.createElement('script');
    mySecondScript.type = 'text/javascript';
    mySecondScript.id="events";
    mySecondScript.innerHTML = '' +
    'if (userSettings["deviceorientation"]==false){' +
    '    delete DeviceOrientationEvent;' +
    '    delete DeviceOrientation;  ' +
    '}' +
    '' +
    'if (userSettings["orientationchange"]==false){' +
    '  delete DeviceMotionEvent;' +
    '  delete DeviceMotion;' +
    '  delete ScreenOrientation;' +
    '' +
    '}'+
    '' +
    'if (userSettings["devicelight"]==false){' +
    '   delete DeviceLightEvent;' +
    '}'+
    '' +
    'if (userSettings["userproximity"]==false){' +
    '   delete UserProximityEvent;'+
    '   delete DeviceProximityEvent '+
    '}'+
    '' +
    '' +
    '';
    top.window.content.document.getElementsByTagName('html')[0].insertBefore(mySecondScript, document.getElementsByTagName("head")[0]);
}

function checkForAdvance(store){
    var distances = {};
    var DAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    var today = DAYS[new Date().getDay()];
    var sets = {};
    pageName= pageName.replace("http://","");
    pageName=pageName.replace("https://","");
    for(var key in store){
        if (pageName.indexOf(key)>-1){
            var dist = distanceString(pageName,key);
            distances[key] = dist;
        }
    };
    if (!isEmpty(distances)){
        var maxPageName = maxDistance(distances);
        if (maxPageName== undefined) { return {};}
        sets=  createUserSettings(store[maxPageName][today]);
    }
    return sets;
}


function createUserSettings(userSettings){
    var today = new Date();
    var hourNow = today.getHours()*60 + today.getMinutes();
    var settings= {};
    for (var key in userSettings){
        if (userSettings[key].access=="off"){
            settings[key] = false;
        }else{
            var start =  userSettings[key].time.start.split(":");
            var end = userSettings[key].time.end.split(":");
            var hourStart = parseInt(start[0])*60+parseInt(start[1]);
            var hourEnd = parseInt(end[0])*60+parseInt(end[1]);
            if (hourStart<hourNow && hourNow < hourEnd){
                settings[key] = true;
            }else{
                settings[key] = false;
            }

        }
    }
    return settings;
}

function distanceString(str1,str2){

    var dist = 0;
    for (var i=0; i<str1.length && i<str2.length;i++){
        if (str1.charAt(i)==str2.charAt(i)){
            dist++;
        }else{
            return dist;
        }
    }

    return dist;
}


function maxDistance( t){
    var max = -1;
    var pageName = "";
    for (var key in t){
        if (t[key]>max){
            max = t[key];
            pageName = key;
        }
    }
    return pageName;
}

function isEmpty(e){

    for (var key in e){
        return false;
    }
    return true;
}


function checkForGroups(store){

    var DAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    var today = DAYS[new Date().getDay()];

    for (var key in store){
        if (key.charAt(0)!='.'){
            continue;
        }
        if (pageName.indexOf(key)>1){
            return createUserSettings(store[key][today]);
        }


    }

}