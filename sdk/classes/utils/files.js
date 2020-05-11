const fs = require("fs");

const getRecursive = function(dir, extn) {
    if (extn.substr(0,1) !== ".") extn = "." + extn;

    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        if (file !== "node_modules") {
            file = dir + '/' + file;
            var stat = fs.statSync(file);
            if (stat && stat.isDirectory()) { 
                results = results.concat(getRecursive(file, extn));
            } else { 
                if (file.slice(extn.length * -1) === extn) {
                    results.push(file);
                }
            }
        }
    });
    return results;
}

module.exports = {
    getRecursive: getRecursive
};