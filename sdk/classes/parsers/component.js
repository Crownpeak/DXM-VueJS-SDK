const babelParser = require("@babel/parser");

let _componentName = "";

const reTemplate = /<template>\s*((?:.|\r|\n)+)\s*<\/template>/i;
const reScript = /<script>\s*((?:.|\r|\n)+)\s*<\/script>/i;
const reList = /^([ \t]*)<!--\s*<List(.*?)\s*type=(["'])([^"']+?)\3(.*?)>\s*-->((.|\s)*?)<!--\s*<\/List>\s*-->/im;
const reListName = /\s+?name\s*=\s*(["'])([^"']+?)\1/i;
const reListItemName = /\s+?itemName\s*=\s*(["'])([^"']+?)\1/i;

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
        console.warn(`COMPONENT: Skipping due to errors`);
        return;
    }

    let results = [];
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
    template = replaceLists(template);

    for (let i = 0, len = bodyParts.length; i < len; i++) {
        const part = bodyParts[i];
        if (part.type === "ExportDefaultDeclaration") {
            const extnds = part.declaration.properties.find(p => p.type === "ObjectProperty" && p.key.name === "extends");
            let name = part.declaration.properties.find(p => p.type === "ObjectProperty" && p.key.name === "name");
            if (extnds && extnds.value.name === "CmsComponent" && name) {
                name = name.value.value;
                //console.log(`Found component ${name} extending CmsComponent`);
                const data = processCmsComponent(content, ast, name, part.declaration, imports, dependencies);
                if (data) {
                    const result = processCmsComponentTemplate(content, name, template, data, imports, dependencies);
                    if (result) {
                        results.push({name: name, content: finalProcessMarkup(result), dependencies: dependencies});
                    }
                }
            }
        }
    }
    return results;
};

const finalProcessMarkup = (content) => {
    // Remove anything that has { and } but doesn't look like a component
    const replacer = /[{]([^}]*?[\s,/$()][^}]*?)[}]/g;
    while (replacer.test(content)) {
        content = content.replace(replacer, "$1");
    }
    return trimSharedLeadingWhitespace(content);
};

const replaceLists = (content) => {
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

const processCmsComponentTemplate = (content, name, template, data, imports, dependencies) => {
    const fieldRegexs = [
        { source: "{{.*?\\/\\*.*?%%name%%.*?\\*\\/.*?}}", replacement: "<!-- {%%fieldname%%:%%fieldtype%%} -->" },
        { source: "{{.*?%%name%%.*?}}", replacement: "{%%fieldname%%:%%fieldtype%%}" },
        { source: "<([a-z0-9:-]*)(\\s*.*?)\\s+v-html\\s*=\\s*([\"'])(%%name%%)\\3([^>]*?)(><\\/\\1>|\\/>)", replacement: "<$1$2$5>{%%fieldname%%:%%fieldtype%%}</$1>" },
        { source: "(\\s+):([A-Za-z0-9]+)\s*=\s*([\"']?)%%name%%\\3", replacement: "$1$2=\"{%%fieldname%%:%%fieldtype%%}\"" }
    ];
    const componentRegexs = [
        { source: "<(%%name%%)([^>]*?)(>.*?<\\/\\1>|\\/>)", replacement: "{%%name%%:%%componentname%%}" }
    ];
    let result = template;
    // Longest name first to avoid substring replacements
    var dataItems = data.sort((a, b) => b.name.length - a.name.length);
    for (let i = 0, len = dataItems.length; i < len; i++) {
        //console.log(`Looking for ${data[i].name}`);
        if (data[i].fieldName) {
            let indexedField = cmsIndexedFieldToString(data[i].indexedField);
            if (indexedField) indexedField = ":" + indexedField;
            for (let j = 0, lenJ = fieldRegexs.length; j < lenJ; j++) {
                let regex = new RegExp(fieldRegexs[j].source.replace("%%name%%", data[i].name));
                let match = regex.exec(result);
                if (match) {
                    const replacement = fieldRegexs[j].replacement.replace("%%fieldname%%", data[i].fieldName).replace("%%fieldtype%%", data[i].fieldType + indexedField);
                    //console.log(`Replacing [${match[0]}] with [${replacement}]`);
                    result = result.replace(regex, replacement);
                }
            }
        } else if (data[i].componentName) {
            for (let j = 0, lenJ = componentRegexs.length; j < lenJ; j++) {
                let regex = new RegExp(componentRegexs[j].source.replace("%%name%%", data[i].name));
                let match = regex.exec(result);
                let index = 0;
                while (match) {
                    if (dependencies.indexOf(data[i].componentName) < 0) dependencies.push(data[i].componentName);
                    let suffix = ++index > 1 ? "_" + index : "";
                    let replacement = componentRegexs[j].replacement.replace("%%name%%", data[i].name + suffix).replace("%%componentname%%", data[i].componentName);
                    //console.log(`Replacing [${match[0]}] with [${replacement}]`);
                    result = result.replace(regex, replacement);
                    match = regex.exec(result);
                }
            }
        }
    }
    return result;
};

const processCmsComponent = (content, ast, name, declaration, imports, dependencies) => {
    _componentName = name;
    //console.log(`Processing CmsComponent ${_componentName}`);
    let results = [];
    const data = declaration.properties.find(p => p.type === "ObjectMethod" && p.key.name === "data");
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

module.exports = {
    parse: parse
};