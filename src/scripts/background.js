import ext from "./utils/ext";
import db from "./updateDB";

ext.runtime.onInstalled.addListener(function() {
  ext.alarms.create("update", {
    "delayInMinutes": 1,
    "periodInMinutes": 60 * 24
  });
  updateRules();
});

ext.alarms.onAlarm.addListener(
  db.GetFiles().then(db.Update).then(updateRules);
);

function updateRules() {
  var conditions = [];
  db.Domains.forEach(function(domain) {
    var url = new URL(domain);
    conditions.push(new ext.declarativeContent.PageStateMatcher({
      pageUrl: { hostSuffix: url.host },
    }));
  });

  ext.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: conditions,
        actions: [ new ext.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
};
