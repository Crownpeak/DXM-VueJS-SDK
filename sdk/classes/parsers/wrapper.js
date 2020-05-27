const fs = require("fs");
const path = require('path');
const cssParser = require("./css");

const reSignature = new RegExp("<([a-z:0-9]+).*?data-cms-wrapper-name\\s*=\\s*[\"']([^\"']+)[\"'](?:.|\\r|\\n)*?<\\/\\1>", "im");

const parse = (file, content) => {
    const match = content.match(reSignature);
    if (match && match.length > 2) {
        let position = match.index;
        const signature = match[0];
        // Process this file - it's good
        //console.log(`Found ${signature} at position ${position}`);
        
        let result = replaceScripts(file, content);
        let uploads = result.uploads;
        
        result = replaceLinks(file, result.content);
        uploads = uploads.concat(result.uploads);

        position = result.content.indexOf(signature);
        const head = result.content.substr(0, position);
        const foot = result.content.substr(position + signature.length);

        let name = match[2];
        name = name[0].toUpperCase() + name.substr(1);
        return {wrapper: {name: name, head: head, foot: foot }, uploads: uploads};
    }

    return {};
};

const replaceScripts = (file, content) => {
    const regex = RegExp("<script[^>]+src=\\s*([\"'])?(.*?)(?:\\1|>|\\s)","gi");

    let result = content;
    let uploads = [];

    const folder = path.dirname(file);
    var matches;
    while (matches = regex.exec(content)) {
        if (matches && matches.length > 2) {
            if (matches[2].indexOf("http") < 0 && matches[2].indexOf("//") < 0) {
                //console.log(`Found script candidate ${matches[2]}`);
                const filename = path.basename(matches[2]);
                let replacement = `<%= Asset.Load(Asset.GetSiteRoot(asset).AssetPath + \"/_Assets/js/${filename}\").GetLink() %>`;
                if (!matches[1]) replacement = `\"${replacement}\"`;
                //console.log(`Replacement is ${replacement}`);
                result = result.replace(matches[2], replacement)
                uploads.push({source: path.join(folder, matches[2]), name: filename, destination: "_Assets/js/"});
            }
        }
    }
    return { content: result, uploads: uploads };
};

const replaceLinks = (file, content) => {
    const regex = RegExp("<link[^>]+href=\\s*([\"'])?(.*?)(?:\\1|>|\\s)","gi");

    let result = content;
    let uploads = [];

    const folder = path.dirname(file);
    var matches;
    while (matches = regex.exec(content)) {
        if (matches && matches.length > 2) {
            if (matches[2].indexOf("http") < 0 && matches[2].indexOf("//") < 0) {
                //console.log(`Found link candidate ${matches[2]}`);
                const filename = path.basename(matches[2]);
                let replacement = `<%= Asset.Load(Asset.GetSiteRoot(asset).AssetPath + \"/_Assets/css/${filename}\").GetLink(LinkType.Include) %>`;
                if (!matches[1]) replacement = `\"${replacement}\"`;
                //console.log(`Replacement is ${replacement}`);
                result = result.replace(matches[2], replacement)

                const filepath = path.join(folder, matches[2]);
                if (fs.existsSync(filepath)) {
                    const result = cssParser.parse(filepath, fs.readFileSync(filepath, "utf8"), folder);
                    if (result.content && result.uploads && result.uploads.length) {
                        uploads.push({source: filepath, name: filename, destination: "_Assets/css/", content: result.content});
                        uploads = uploads.concat(result.uploads);
                    } else {
                        uploads.push({source: filepath, name: filename, destination: "_Assets/css/"});
                    }
                } else {
                    uploads.push({source: filepath, name: filename, destination: "_Assets/css/"});
                }
            }
        }
    }
    return { content: result, uploads: uploads };
};

module.exports = {
    parse: parse
};