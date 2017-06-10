import storage from "./utils/storage";
import yaml from "./utils/js-yaml.min";

var refresh = function(name, cb) {
  var dirListingURL = "https://api.github.com/repositories/17724730/contents/_data/";
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      try {
        cb(xhr.responseText);
      } catch(e) {
        console.log("failed to load file:", e);
        return
      }
    }
  };
  xhr.open("GET", dirListingURL + name, true);
  xhr.send();
}

var GetFiles = function() {
  refresh("", function(dat) {
    var listing = JSON.parse(dat);
    listing.forEach(function (file) {
      GetFile(file.name, file.sha);
    });
  })
}

var GetFile = function(name, hash) {
  storage.get('file/' + name, function(dat) {
    if(dat.hash !== hash) {
      refresh(name, (function(name, hash, dat) {
        var doc = yaml.safeLoad(dat);
        doc.hash = hash;
        storage.set({'file/' + name : doc});
      }).bind(this, name, hash));
    }
  });
};

module.exports = {GetFiles: GetFiles, GetFile: GetFile};
