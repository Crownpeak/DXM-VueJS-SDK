const cssParser = require("./css");
const utils = require("crownpeak-dxm-sdk-core/lib/crownpeak/utils");

const reSignature = new RegExp("<([a-z:0-9\\-]+).*?data-cms-wrapper-name\\s*=\\s*[\"']([^\"']+)[\"'](?:.|\\r|\\n)*?<\\/\\1>", "im");

const parse = (file, content) => {
    const match = content.match(reSignature);
    if (match && match.length > 2) {
        let position = match.index;
        const signature = match[0];
        // Process this file - it's good
        //console.log(`Found ${signature} at position ${position}`);
        
        let result = utils.replaceAssets(file, content, cssParser);

        position = result.content.indexOf(signature);
        const head = result.content.substr(0, position);
        const foot = result.content.substr(position + signature.length);

        let name = match[2];
        name = name[0].toUpperCase() + name.substr(1);
        return {wrapper: {name: name, head: head, foot: foot }, uploads: result.uploads};
    }

    return {};
};

module.exports = {
    parse: parse
};