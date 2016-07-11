function dummy(text, callback) {
  callback(text);
}

exports.dummy = dummy;

var ss = require("sdk/simple-storage");
var { ToggleButton }  = require('sdk/ui/button/toggle');
let { getActiveView }=require("sdk/view/core");
var panels = require("sdk/panel");
var self = require("sdk/self");
var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");

var button = ToggleButton({
    id: "PP",
    label: "Privacy Protector",
    icon: {
        "16": "./icon.png"
    },
    onChange: handleChange
});

var panel = panels.Panel({
    width: 360,
    height: 475,
    contentURL: self.data.url("popup.html"),
    contentScriptFile: [self.data.url("../_popup/libs/jQuery.js"),
                        self.data.url("../_popup/bootstrap-components/bootstrap-toggle/js/bootstrap-toggle.min.js"),
                        self.data.url("../_popup/bootstrap-components/bootstrap-3.3.6-dist/js/bootstrap.min.js"),
                        self.data.url("extra.js")],
    contentScriptWhen: 'ready',
    onHide: handleHide,
    onMessage: function (message){
        switch(message.method) {
            case 'setValue':
                ss.storage[message.key] = message.value;
                panel.postMessage(ss);
                break;
            case 'advance':
                showAdvancePanel();
                break;
        }
    },
    onShow: function (){
        panel.postMessage(ss);
    }
});


var advancePanel = panels.Panel({
    width: 1100,
    height: 800,
    contentURL: self.data.url("../_popup/components/page.html"),
    contentScriptFile: [self.data.url("../_popup/libs/jQuery.js"),
        self.data.url("../_popup/bootstrap-components/bootstrap-3.3.6-dist/js/bootstrap.min.js"),
        self.data.url("../_popup/bootstrap-components/bootstrap-toggle/js/bootstrap-toggle.min.js"),
        self.data.url("../_popup/bootstrap-components/bootstrap-slider/bootstrap-slider.js"),
        self.data.url("../_popup/bootstrap-components/bootstrap-sweetalert/dist/sweetalert.min.js"),
        self.data.url("../_popup/bootstrap-components/boostrap-paginator/jquery.twbsPagination.min.js"),
                        self.data.url("../_popup/js/page.js")],
    contentScriptWhen: 'end',
    onMessage: function (message){
        switch(message.method) {
            case 'setValue':
                delete  ss.storage[message.key];
                ss.storage[message.key] = message.value;
                advancePanel.postMessage(ss);
                break;
            case 'close':
                hideAdvancePanel();
                break;
        }
    },
    onShow: function (){
        getActiveView(advancePanel).setAttribute("noautohide", true);
        getActiveView(advancePanel).setAttribute("backdrag", true);
        advancePanel.postMessage(ss);
    }
});




pageMod.PageMod({
    include: "*",
    contentScriptFile:[data.url("../_popup/js/inject.js")],
    contentScriptWhen:"start",
    onAttach: function(worker) {
        worker.port.emit("message",ss);
    }
});



function handleChange(state) {
    if (state.checked) {
        panel.show({
            position: button
        });
    }
}

function hideAdvancePanel(){
    advancePanel.hide();
}

function showAdvancePanel(){
    advancePanel.show();
}


function handleHide() {
    button.state('window', {checked: false});
}


