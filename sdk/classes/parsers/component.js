const fs = require("fs");
const path = require('path');
const babelParser = require("@babel/parser");
const cssParser = require("./css");
const utils = require("crownpeak-dxm-sdk-core/lib/crownpeak/utils");

let _componentName = "";
let _componentCache = {};

const reList = /^([ \t]*)<!--\s*<List(.*?)\s*type=(["'])([^"']+?)\3(.*?)>\s*-->((.|\s)*?)<!--\s*<\/List>\s*-->/im;
const reListName = /\s+?name\s*=\s*(["'])([^"']+?)\1/i;
const reListItemName = /\s+?itemName\s*=\s*(["'])([^"']+?)\1/i;

const parse = (content, file) => {
    const {templates, scripts, styles} = getParts(file, content);

    let template = templates.join("\n");
    const script = scripts.join("\n");

    const ast = babelParser.parse(script, {
        sourceType: "module"
    });
    //console.log(JSON.stringify(ast));
    if (ast.errors && ast.errors.length > 0) {
        console.warn(`COMPONENT: Skipping due to errors`);
        return;
    }

    let results = [];
    let uploads = [];
    let imports = [];
    let dependencies = [];
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
    }

    // Parse out any special lists
    template = replaceLists(template, dependencies);

    for (let i = 0, len = bodyParts.length; i < len; i++) {
        const part = bodyParts[i];
        if (part.type === "ExportDefaultDeclaration") {
            const extnds = part.declaration.properties.find(p => p.type === "ObjectProperty" && p.key.name === "extends");
            let name = part.declaration.properties.find(p => p.type === "ObjectProperty" && p.key.name === "name");
            if (extnds && extnds.value.name === "CmsComponent" && name) {
                const cmsProps = processCmsProperties(content, name, part.declaration, imports);
                name = name.value.value;
                //console.log(`Found component ${name} extending CmsComponent`);
                const data = processCmsComponent(content, ast, name, part.declaration, imports, dependencies);
                if (data) {
                    const result = processCmsComponentTemplate(content, name, template, data, imports, dependencies);
                    if (result) {
                        const processedResult = utils.replaceAssets(file, finalProcessMarkup(result), cssParser, true);
                        uploads = uploads.concat(processedResult.uploads);
                        results.push({name: name, content: processedResult.content, folder: cmsProps.folder, zones: typeof(cmsProps.zones) === "string" ? cmsProps.zones.split(",") : cmsProps.zones, dependencies: dependencies});
                    }
                }
            }
        }
    }
    return { components: results, uploads: uploads };
};

const finalProcessMarkup = (content) => {
    // Remove anything that has { and } but doesn't look like a component
    const replacer = /[{]([^}]*?[\s,/$()][^}]*?)[}]/g;
    while (replacer.test(content)) {
        content = content.replace(replacer, "$1");
    }
    // Replacements from .cpscaffold.json file
    content = utils.replaceMarkup(content);
    return trimSharedLeadingWhitespace(content);
};

const replaceLists = (content, dependencies) => {
    let match;
    while (match = reList.exec(content)) {
        let attributes = " " + match[2] + " " + match[5];
        let name = "";
        let itemName = "";
        const ws = match[1];
        const type = match[4];
        if (reListName.test(attributes)) {
            const nameMatch = reListName.exec(attributes);
            name = nameMatch[2];
        }
        if (reListItemName.test(attributes)) {
            const nameMatch = reListItemName.exec(attributes);
            itemName = nameMatch[2];
        }
        if (!name) {
            name = type + "s"; // TODO: better way to make plural
        }
        if (!itemName) {
            itemName = type;
        }
        //console.log(`Found list with name ${name}`);
        const repl = `${ws}<cp-list name="${name}">\r\n${ws}  {${itemName}:${type}}\r\n${ws}</cp-list>`;
        addDependency(type, dependencies);
        content = content.replace(match[0], repl);
    }
    return content;
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
        if (match) maxLeader = Math.min(maxLeader, match[0].length);
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

const processCmsComponentTemplate = (content, name, template, data, imports, dependencies) => {
    const scaffoldPreRegexs = [
        { source: "<!--\\s*cp-scaffold\\s*((?:.|\\r|\\n)*?)\\s*else\\s*-->\\s*((?:.|\\r|\\n)*?)\\s*<!--\\s*\\/cp-scaffold\\s*-->", replacement: "<!-- cp-pre-scaffold $1 /cp-pre-scaffold -->" },
        { source: "<!--\\s*cp-scaffold\\s*((?:.|\\r|\\n)*?)\\s*\\/cp-scaffold\\s*-->", replacement: "$1"}
    ];
    const scaffoldPostRegexs = [
        { source: "<!--\\s*cp-pre-scaffold\\s*((?:.|\\r|\\n)*?)\\s*\\/cp-pre-scaffold\\s*-->", replacement: "$1"}
    ];
    const fieldRegexs = [
        { source: "{{.*?\\/\\*.*?%%name%%.*?\\*\\/.*?}}", replacement: "<!-- {%%fieldname%%:%%fieldtype%%} -->" },
        { source: "{{.*?%%name%%.*?}}", replacement: "{%%fieldname%%:%%fieldtype%%}" },
        { source: "<([a-z0-9:-]*)(\\s*.*?)\\s+v-html\\s*=\\s*([\"'])(%%name%%)\\3([^>]*?)(><\\/\\1>|\\/>)", replacement: "<$1$2$5>{%%fieldname%%:%%fieldtype%%}</$1>" },
        { source: "(\\s+)(?:v-bind)?:([A-Za-z0-9]+)\s*=\s*([\"']?)%%name%%\\3", replacement: "$1$2=\"{%%fieldname%%:%%fieldtype%%}\"" }
    ];
    const componentRegexs = [
        { source: "<(%%name%%)([^>]*?)(>.*?<\\/\\1>|\\/>)", replacement: "{%%name%%:%%componentname%%}" }
    ];
    let result = template;
    for (let j = 0, lenJ = scaffoldPreRegexs.length; j < lenJ; j++) {
        let regex = new RegExp(scaffoldPreRegexs[j].source);
        let match = regex.exec(result);
        while (match) {
            let replacement = scaffoldPreRegexs[j].replacement;
            //console.log(`Replacing [${match[0]}] with [${replacement}]`);
            result = result.replace(regex, replacement);
            match = regex.exec(result);
        }
    }
    // Longest name first to avoid substring replacements
    var dataItems = data.sort((a, b) => b.name.length - a.name.length);
    for (let i = 0, len = dataItems.length; i < len; i++) {
        //console.log(`Looking for ${dataItems[i].name}`);
        if (dataItems[i].fieldName) {
            let indexedField = cmsIndexedFieldToString(dataItems[i].indexedField);
            if (indexedField) indexedField = ":" + indexedField;
            for (let j = 0, lenJ = fieldRegexs.length; j < lenJ; j++) {
                let regex = new RegExp(fieldRegexs[j].source.replace("%%name%%", dataItems[i].name));
                let match = regex.exec(result);
                while (match) {
                    const replacement = fieldRegexs[j].replacement.replace("%%fieldname%%", dataItems[i].fieldName).replace("%%fieldtype%%", dataItems[i].fieldType + indexedField);
                    //console.log(`Replacing [${match[0]}] with [${replacement}]`);
                    result = result.replace(regex, replacement);
                    addDependency(dataItems[i].fieldType, dependencies);
                    match = regex.exec(result);
                }
            }
        } else if (dataItems[i].componentName) {
            for (let j = 0, lenJ = componentRegexs.length; j < lenJ; j++) {
                let regex = new RegExp(componentRegexs[j].source.replace("%%name%%", dataItems[i].name));
                let match = regex.exec(result);
                let index = 0;
                while (match) {
                    let suffix = ++index > 1 ? "_" + index : "";
                    let replacement = componentRegexs[j].replacement.replace("%%name%%", dataItems[i].name + suffix).replace("%%componentname%%", dataItems[i].componentName);
                    //console.log(`Replacing [${match[0]}] with [${replacement}]`);
                    result = result.replace(regex, replacement);
                    addDependency(dataItems[i].componentName, dependencies);
                    match = regex.exec(result);
                }
            }
        }
    }
    let importItems = imports.sort((a, b) => b.length - a.length);
    for (let i = 0, len = importItems.length; i < len; i++) {
        //console.log(`Looking for ${importItems[i]}`);
        for (let j = 0, lenJ = componentRegexs.length; j < lenJ; j++) {
            let regex = new RegExp(componentRegexs[j].source.replace("%%name%%", importItems[i]));
            let match = regex.exec(result);
            let index = 0;
            while (match) {
                let suffix = ++index > 1 ? "_" + index : "";
                let replacement = componentRegexs[j].replacement.replace("%%name%%", importItems[i] + suffix).replace("%%componentname%%", importItems[i]);
                //console.log(`Replacing [${match[0]}] with [${replacement}]`);
                result = result.replace(regex, replacement);
                addDependency(importItems[i], dependencies);
                match = regex.exec(result);
            }
        }
    }
    for (let j = 0, lenJ = scaffoldPostRegexs.length; j < lenJ; j++) {
        let regex = new RegExp(scaffoldPostRegexs[j].source);
        let match = regex.exec(result);
        while (match) {
            let replacement = scaffoldPostRegexs[j].replacement;
            //console.log(`Replacing [${match[0]}] with [${replacement}]`);
            result = result.replace(regex, replacement);
            match = regex.exec(result);
        }
    }
    return result;
};

const processCmsComponent = (content, ast, name, declaration, imports, dependencies) => {
    _componentName = name;
    //console.log(`Processing CmsComponent ${_componentName}`);
    let results = [];
    // Specified as data() { ... }
    let data = declaration.properties.find(p => p.type === "ObjectMethod" && p.key.name === "data");
    if (!data) {
        // Specified as data: function() { ... }
        data = declaration.properties.find(p => p.type === "ObjectProperty" && p.key.name === "data");
        if (data) data = data.value;
    }
    if (data) {
        const props = data.body.body[0].argument.properties;
        for (let i = 0; len = props.length, i < len; i++) {
            const prop = props[i];
            if (prop.value && prop.value.callee && prop.value.callee.name === "CmsField" && prop.value.arguments && prop.value.arguments.length > 1) {
                const args = prop.value.arguments;
                if (args[1].property && args[1].property.name) {
                    if (args.length > 3 && args[3].object && args[3].object.type === "Identifier" && args[3].object.name === "CmsIndexedField") {
                        // Items of the form CmsField("Heading", CmsFieldTypes.TEXT, something, CmsIndexedField.TYPE)
                        //console.log(`Found property [${prop.key.name}] with field name [${args[0].value}], type [${args[1].property.name}] and indexedField [$(args[3].property.name)]`);
                        results.push({
                            name: prop.key.name,
                            fieldName: args[0].value,
                            fieldType: cmsFieldTypeToString(args[1].property.name),
                            indexedField: args[3].property.name
                        });
                    } else {
                        // Items of the form CmsField("Heading", CmsFieldTypes.TEXT)
                        //console.log(`Found property [${prop.key.name}] with field name [${args[0].value}] of type [${args[1].property.name}]`);
                        results.push({
                            name: prop.key.name,
                            fieldName: args[0].value,
                            fieldType: cmsFieldTypeToString(args[1].property.name)
                        });
                    }
                } else if (args[1].type === "StringLiteral" && args[1].value) {
                    if (args.length > 3 && args[3].object && args[3].object.type === "Identifier" && args[3].object.name === "CmsIndexedField") {
                        // Items of the form CmsField("Heading", "FieldType", something, CmsIndexedField.TYPE)
                        //console.log(`Found property [${prop.key.name}] with field name [${args[0].value}], type [${args[1].value}] and indexedField [$(args[3].property.name)]`);
                        results.push({
                            name: prop.key.name,
                            fieldName: args[0].value,
                            fieldType: cmsFieldTypeToString(args[1].value),
                            indexedField: args[3].property.name
                        });
                    } else {
                        // Items of the form CmsField("Heading", "FieldType")
                        //console.log(`Found property [${prop.key.name}] with field name [${args[0].value}] of type [${args[1].value}]`);
                        results.push({
                            name: prop.key.name,
                            fieldName: args[0].value,
                            fieldType: cmsFieldTypeToString(args[1].value)
                        });
                    }
                }
            }
        }
    }
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
    return results;
};

const processCmsProperties = (content, name, declaration, imports) => {
    return { 
        folder: getCmsProperty(declaration, "cmsFolder", ""),
        zones: getCmsProperty(declaration, "cmsZones", [])
    };
};

const getCmsProperty = (declaration, name, defaultValue) => {
    const properties = declaration.properties;
    for (let i = 0, len = properties.length; i < len; i++) {
        const prop = properties[i];
        if (prop.type === "ObjectProperty"
            && prop.key && prop.key.name === name
            && prop.value) {
            if (prop.value.type === "ArrayExpression") {
                return prop.value.elements.map(e => e.value);
            } else {
                return prop.value.value;
            }
        }
    }
    return defaultValue;
};

const addDependency = (type, dependencies) => {
    if (utils.isCoreComponent(type)) return;
    if (dependencies.indexOf(type) < 0) dependencies.push(type);
};

const cmsFieldTypeToString = (cmsFieldType) => {
    if (cmsFieldType === "IMAGE") return "Src";
    if (cmsFieldType === cmsFieldType.toUpperCase()) {
        // TODO: robusify this!
        return cmsFieldType[0] + cmsFieldType.substr(1).toLowerCase();
    }
    return cmsFieldType;
};

const cmsIndexedFieldToString = (cmsIndexedField) => {
    if (!cmsIndexedField || cmsIndexedField === "NONE") return "";
    if (cmsIndexedField === "DATETIME") return "IndexedDateTime";
    if (cmsIndexedField === cmsIndexedField.toUpperCase()) {
        // TODO: robusify this!
        return "Indexed" + cmsIndexedField[0] + cmsIndexedField.substr(1).toLowerCase();
    }
    return "Indexed" + cmsIndexedField;
};

const getItemsByTag = (file, content, tag) => {
    const reItems = new RegExp(`<${tag}.*?(?:>(?:.|\\r|\\n)*?<\\/${tag}>|\\/>)`, "ig");
    const reSrc = new RegExp(`<${tag}[^>]*\\s+src\\s*=\\s*(["']?)([^"']*?)\\1`, "i");
    const reContent = new RegExp(`<${tag}(?:[^>]*?)>\\s*((?:.|\\s)*?)<\\/${tag}>`, "i");

    let results = [];
    let item;
    while (item = reItems.exec(content)) {
        //console.log(`DEBUG: found ${match}`);
        let src = reSrc.exec(item);
        if (src && src.length > 2) {
            // This item has a src attribute, so follow it if we can
            if (src[2].indexOf("http") < 0 && src[2].indexOf("//") !== 0) {
                const filepath = path.resolve(path.dirname(file), src[2]);
                if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) results.push(fs.readFileSync(filepath));
            }
        } else {
            let content = reContent.exec(item);
            if (content && content.length > 1) {
                // This item has content
                results.push(content[1]);
            }
        }
    }
    return results;
};

const getTemplates = (file, content) => {
    return getItemsByTag(file, content, "template");
};

const getScripts = (file, content) => {
    return getItemsByTag(file, content, "script");
};

const getStyles = (file, content) => {
    return getItemsByTag(file, content, "style");
};

const getParts = (file, content) => {
    let result = _componentCache[file];
    if (!result) {
        result = { 
            templates: getTemplates(file, content),
            scripts: getScripts(file, content),
            styles: getStyles(file, content)
        };
        _componentCache[file] = result;
    }
    return result;
};

const isCmsComponent = (file, content) => {
    const reComponent = new RegExp("extends\\s*:\\s*CmsComponent");

    //console.log(`Checking if ${file} is a CMS component`);
    const { templates, scripts, styles } = getParts(file, content);
    return scripts.filter(s => reComponent.exec(s)).length > 0;
};

module.exports = {
    parse: parse,
    isCmsComponent: isCmsComponent
};