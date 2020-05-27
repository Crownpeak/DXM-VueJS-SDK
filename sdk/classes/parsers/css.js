const fs = require("fs");
const path = require('path');

// TODO: imports
const reUrl = /url\s*\(\s*([^)]*)\s*\)/ig;

const parse = (file, content, folderRoot) => {
    //console.log(`DEBUG: CSS Parsing ${file}`);
    return replaceUrls(file, content, folderRoot);
};

const replaceUrls = (file, content, folderRoot) => {
    let result = content;
    let uploads = [];

    var matches;
    while (matches = reUrl.exec(content)) {
        if (matches && matches.length > 1) {
            let url = matches[1];
            if (url.indexOf("http") < 0 && url.indexOf("//") < 0) {
                //console.log(`Found url candidate ${url}`);
                if (url.indexOf("?") >= 0) url = url.substr(0, url.indexOf("?"));
                const filepath = path.join(folderRoot, url);
                if (fs.existsSync(filepath)) {
                    const filename = path.basename(url);
                    const dest = "_Assets/" + (isImage(url) ? "images/" : "");
                    let replacement = `"<%= Asset.Load(Asset.GetSiteRoot(asset).AssetPath + \"/${dest}${filename}\").GetLink() %>"`;
                    //console.log(`Replacement is ${replacement}`);
                    result = result.replace(matches[1], replacement);
                    uploads.push({source: path.join(folderRoot, url), name: filename, destination: dest});
                }
            }
        }
    }
    return { content: result, uploads: uploads };
};

const isImage = (url) => {
    return url.indexOf(".jpg") > 0
    || url.indexOf(".jpeg") > 0
    || url.indexOf(".gif") > 0
    || url.indexOf(".svg") > 0
    || url.indexOf(".png") > 0
    || url.indexOf(".webp") > 0;
};

module.exports = {
    parse: parse
};