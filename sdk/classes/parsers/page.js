const babelParser = require("@babel/parser");

let _pageName = "";

const reTemplate = /<template>\s*((?:.|\r|\n)+)\s*<\/template>/i;
const reScript = /<script>\s*((?:.|\r|\n)+)\s*<\/script>/i;

const parse = (content) => {
    let match = reTemplate.exec(content);
    if (!match) return;
    let template = match[1];

    match = reScript.exec(content);
    if (!match) return;
    
    const script = match[1];

    const ast = babelParser.parse(script, {
        sourceType: "module"
    });
    //console.log(JSON.stringify(ast));
    if (ast.errors && ast.errors.length > 0) {
        console.warn(`PAGE: Skipping due to errors`);
        return;
    }

    let results = [];
    let imports = [];
    const bodyParts = ast.program.body;
    for (let i = 0, len = bodyParts.length; i < len; i++) {
        const part = bodyParts[i];
        if (part.type === "ImportDeclaration" && part.specifiers && part.specifiers.length > 0) {
            for (let i in part.specifiers) {
                const specifier = part.specifiers[i];
                if ((specifier.type === "ImportDefaultSpecifier" || specifier.type === "ImportSpecifier")
                    && specifier.local && specifier.local.type === "Identifier") {
                    //console.log(`Found import ${specifier.local.name}`);
                    imports.push(specifier.local.name);
                }
            }
        }
        else if (part.type === "ExportDefaultDeclaration") {
            const extnds = part.declaration.properties.find(p => p.type === "ObjectProperty" && p.key.name === "extends");
            let name = part.declaration.properties.find(p => p.type === "ObjectProperty" && p.key.name === "name");
            if (extnds && name && (extnds.value.name === "CmsDynamicPage" || extnds.value.name === "CmsStaticPage")) {
                name = name.value.value;
                //console.log(`Found page ${name} extending ${extnds.value.name}`);
                const data = processCmsPage(content, ast, name, part.declaration, imports);
                if (data && data.components) {
                    const result = processCmsPageTemplate(content, name, template, data.components, imports);
                    if (result) {
                        results.push({name: name, content: finalProcessMarkup(result), wrapper: data.wrapper});
                    }
                }
            }
        }
    }
    return results;
};

const initialProcessMarkup = (content) => {
    // TODO: find a way to run this without breaking the ability to make replacements
    // Remove any { and }
    return content.replace(/[{]|[}]/g, "");
};

const finalProcessMarkup = (content) => {
    return trimSharedLeadingWhitespace(content);
};

const trimSharedLeadingWhitespace = (content) => {
    // Trim leading whitespace common to all lines except blanks
    const onlyWhitespace = /^\s*$/;
    const leadingWhitespace = /^\s*/;
    let lines = content.split(`\n`);
    let maxLeader = 99;
    for (let i in lines) {
        let line = lines[i];
        if (i == 0 || onlyWhitespace.test(line)) continue;
        let match = line.match(leadingWhitespace);
        if (match && match[0].length) maxLeader = Math.min(maxLeader, match[0].length);
    }
    if (maxLeader > 0) {
        const leadingWhitespaceReplacer = new RegExp(`^\\s{${maxLeader}}`);
        for (let i in lines) {
            let line = lines[i];
            if (i == 0 || onlyWhitespace.test(line)) continue;
            lines[i] = line.replace(leadingWhitespaceReplacer, "");
        }
        content = lines.join('\n');
    }
    return content;
};

const processCmsPageTemplate = (content, name, template, components, imports) => {
    const componentRegexs = [
        { source: "<(%%name%%)([^>]*?)(>.*?<\\/\\1>|\\/>)", replacement: "{%%name%%}" }
    ];
    let result = template;
    // Longest name first to avoid substring replacements
    var dataItems = components.sort((a, b) => b.name.length - a.name.length);
    for (let i = 0, len = dataItems.length; i < len; i++) {
        //console.log(`Looking for ${data[i].name}`);
        for (let j = 0, lenJ = componentRegexs.length; j < lenJ; j++) {
            let regex = new RegExp(componentRegexs[j].source.replace("%%name%%", components[i].name));
            let match = regex.exec(result);
            let index = 0;
            while (match) {
                let suffix = ++index > 1 ? "_" + index + ":" + components[i].componentName : "";
                let replacement = componentRegexs[j].replacement.replace("%%name%%", components[i].name + suffix);
                //console.log(`Replacing [${match[0]}] with [${replacement}]`);
                result = result.replace(regex, replacement);
                match = regex.exec(result);
            }
        }
    }
    return result;
};

const processCmsPage = (content, ast, name, declaration, imports) => {
    _pageName = name;
    //console.log(`Processing CmsPage ${_pageName}`);
    let results = [];
    const components = declaration.properties.find(p => p.type === "ObjectProperty" && p.key.name === "components");
    if (components) {
        const props = components.value.properties;
        for (let i = 0; len = props.length, i < len; i++) {
            const prop = props[i];
            if (prop.type === "ObjectProperty") {
                //console.log(`Found component property [${prop.key.name}]`);
                results.push({
                    name: prop.key.name,
                    componentName: prop.key.name
                });
            }
        }
    }
    let wrapper = declaration.properties.find(p => p.type === "ObjectProperty" && p.key.name === "cmsWrapper");
    if (wrapper) {
        //console.log(`Found reference to wrapper [${wrapper}]`);
        wrapper = wrapper.value.value;
    }
    return {components: results, wrapper: wrapper};
};

module.exports = {
    parse: parse
};