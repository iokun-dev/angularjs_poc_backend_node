exports.walkclean = (x) => {
    var type = typeof x;
    if (x instanceof Array) {
        type = 'array';
    }
    if ((type == 'array') || (type == 'object')) {
        for (k in x) {
            var v = x[k];
            if ((v === '' || v === null || v === 'null' || v === undefined || v === 'undefined') && (type == 'object')) {
                delete x[k];
            } else {
                this.walkclean(v);
            }
        }
    }

};

exports.walklean = (lpJson) => {
    Object.keys(lpJson).forEach(key => {
        if (lpJson[key] === undefined || lpJson[key] === "" || lpJson[key] === null) {
          delete lpJson[key];
        }
        
      });
      return lpJson;
}
