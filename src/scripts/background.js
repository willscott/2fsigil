import ext from "./utils/ext";
import db from "./updateDB";

ext.runtime.onInstalled.addListener(function() {
  ext.alarms.create("update", {
    "delayInMinutes": 1,
    "periodInMinutes": 60 * 24
  });
});

ext.alarms.onAlarm.addListener(function() {
  db.GetFiles().then(db.Update).then(updateRules);
});

ext.browserAction.onClicked.addListener(function(tab) {
  var host = new URL(tab.url).host;
  var found = false;
  Object.keys(db.Links).forEach(function (dom) {
    if (!found && host.endsWith(dom)) {
      found = true;
      ext.tabs.create({url: db.Links[dom]});
    }
  });
  if (!found) {
    ext.tabs.create({url: "https://github.com/2factorauth/twofactorauth/issues/new?title=Please Add " + host + "&body=Please Add " + host});
  }
});


// per https://stackoverflow.com/questions/28750081/cant-pass-arguments-to-chrome-declarativecontent-seticon#28765872
function createSetIconAction(path, callback) {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var image = new Image();
  image.onload = function() {
    ctx.drawImage(image,0,0,19,19);
    var imageData = ctx.getImageData(0,0,19,19);
    var action = new chrome.declarativeContent.SetIcon({imageData: imageData});
    callback(action);
  }
  image.src = chrome.runtime.getURL(path);
}


function updateRules(domains) {
  var conditions = [];
  // 2factorauth notably has subdomains for google, but not www.google.com. add it:
  conditions.push(new chrome.declarativeContent.PageStateMatcher({
    pageUrl: {hostSuffix: "google.com"}
  }));
  
  domains.forEach(function(domain) {
    var url = new URL(domain).host;
    if (url.startsWith("www.")) {
      url = url.split("www.")[1];
    }
    conditions.push(new chrome.declarativeContent.PageStateMatcher({
      pageUrl: { hostSuffix: url },
    }));
  });

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    createSetIconAction("icons/action-19.png", function(setIconAction) {
      chrome.declarativeContent.onPageChanged.addRules([
        {
          conditions: conditions,
          actions: [ setIconAction ]
        }]);
    });
  });
};
