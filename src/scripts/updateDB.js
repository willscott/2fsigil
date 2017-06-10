import storage from "./utils/storage";
import yaml from "./utils/js-yaml.min";

var refresh = function(fname, cb) {
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
  xhr.open("GET", fname, true);
  xhr.send();
}

var GetFiles = function(cb) {
  refresh("https://api.github.com/repositories/17724730/contents/_data/", function(dat) {
    var listing = JSON.parse(dat);
    var state = {inprogress: 0, files: [], done: cb};
    state.complete = (function () {
      this.inprogress--;
      if (this.inprogress == 0) {
        this.done();
      }
    }).bind(state);
    listing.forEach(function (file) {
      state.inprogress++;
      state.files.push(file.name);
      GetFile(file.name, file.sha, state);
    });
  })
}

var GetFile = function(name, hash, state) {
  storage.get('file/' + name, function(dat) {
    if(dat.hash !== hash) {
      refresh("https://raw.githubusercontent.com/2factorauth/twofactorauth/master/_data/" + name, (function(name, hash, dat) {
        var doc = yaml.safeLoad(dat);
        doc.hash = hash;
        storage.set({'file/' + name : doc});
        state.complete();
      }).bind(this, name, hash));
    } else {
      state.complete();
    }
  });
};

module.exports = {GetFiles: GetFiles, GetFile: GetFile};
