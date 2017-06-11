import ext from "./utils/ext";
import db from "./updateDB";

ext.alarms.create("update", {
  "delayInMinutes": 1,
  "periodInMinutes": 60 * 24
});

ext.alarms.onAlarm.addListener(
  db.GetFiles(db.Update)
);
