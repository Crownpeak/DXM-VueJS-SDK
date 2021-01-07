const cssParser = require("./css");
const utils = require("crownpeak-dxm-sdk-core/lib/crownpeak/utils");

const reSignature = new RegExp("<([a-z:0-9\\-]+).*?data-cms-wrapper-name\\s*=\\s*[\"']([^\"']+)[\"'](?:.|\\r|\\n)*?(?:<\\/\\1>|\\/>)", "im");

const parse = (file, content) => {
    const match = content.match(reSignature);
    if (match && match.length > 2) {
        let position = match.index;
        const signature = match[0];
        // Process this file - it's good
        //console.log(`Found ${signature} at position ${position}`);
        
        let result = processScaffolds(content);
        result = utils.replaceAssets(file, result, cssParser);

        position = result.content.indexOf(signature);
        const head = result.content.substr(0, position);
        const foot = result.content.substr(position + signature.length);

        let name = match[2];
        name = name[0].toUpperCase() + name.substr(1);
        return {wrapper: {name: name, head: head, foot: foot }, uploads: result.uploads};
    }

    return {};
};

const processScaffolds = (content) => {
    const scaffoldRegexs = [
        { source: "<!--\\s*cp-scaffold\\s*((?:.|\\r|\\n)*?)\\s*else\\s*-->\\s*((?:.|\\r|\\n)*?)\\s*<!--\\s*\\/cp-scaffold\\s*-->", replacement: "$1" },
        { source: "<!--\\s*cp-scaffold\\s*((?:.|\\r|\\n)*?)\\s*\\/cp-scaffold\\s*-->", replacement: "$1"}
    ];
    let result = content;
    for (let j = 0, lenJ = scaffoldRegexs.length; j < lenJ; j++) {
        let regex = new RegExp(scaffoldRegexs[j].source);
        let match = regex.exec(result);
        while (match) {
            let replacement = scaffoldRegexs[j].replacement;
            //console.log(`Replacing [${match[0]}] with [${replacement}]`);
            result = result.replace(regex, replacement);
            match = regex.exec(result);
        }
    }
    return result;
};

module.exports = {
    parse: parse
};