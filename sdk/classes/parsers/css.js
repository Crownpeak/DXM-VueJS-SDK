const fs = require("fs");
const utils = require("crownpeak-dxm-sdk-core/lib/crownpeak/utils");

// TODO: imports
const reUrl = /url\s*\(\s*((["']?)([^)]*)\2)\s*\)/ig;
const reContent = /content\s*:\s*\s*(["'])(.)\1/ig;

const parse = (file, content, folderRoot, prefix = "") => {
    //console.log(`DEBUG: CSS Parsing ${file}`);
    return replaceUrls(file, content, folderRoot, prefix);
};

const replaceUrls = (file, content, folderRoot, prefix) => {
    let result = content;
    let uploads = [];

    var matches;
    while (matches = reUrl.exec(content)) {
        if (matches && matches.length > 1) {
            let url = matches[3];
            if (url.indexOf("http") < 0 && url.indexOf("//") < 0) {
                //console.log(`Found url candidate ${url}`);
                let { path: filepath, folder: dir, filename } = utils.getPaths(file, url);
                if (prefix && dir.startsWith(prefix)) {
                    dir = dir.substr(prefix.length);
                }
                if (fs.existsSync(filepath)) {
                    let replacement = `"<%= Asset.Load(Asset.GetSiteRoot(asset).AssetPath + \"/${dir}${filename}\").GetLink() %>"`;
                    //console.log(`Replacement is ${replacement}`);
                    result = result.replace(matches[1], replacement);
                    uploads.push({source: filepath, name: filename, destination: dir});
                }
            }
        }
    }
    while (matches = reContent.exec(result)) {
        // Replace unicode expressions with escaped values, else we mangle them
        const char = matches[2].charCodeAt(0);
        if (char > 127) {
            result = result.replace(matches[0], `content:"\\${char.toString(16).toUpperCase()}"`)
        }
    }
    return { content: result, uploads: uploads };
};

module.exports = {
    parse: parse
};