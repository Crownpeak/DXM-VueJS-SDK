#!/usr/bin/env node
const dotenv = require("dotenv");
const fs = require("fs");

const _args = process.argv.slice(2);

const main = () => {
    const cwd = process.env.INIT_CWD || require('path').resolve('.');
    let config = process.env;
    // Merge in any environment changes they provided
    if (fs.existsSync(cwd + "/.env")) {
        Object.assign(config, dotenv.parse(fs.readFileSync(cwd + "/.env")))
    }

    // Check we have everything we need to work
    if (!validateInput(config)) return;

    const cms = require("./cms");
    cms.init(config);

    const parser = require("../parsers/parser");
    const files = require("../utils/files");

    let components = [], pages = [], wrappers = [], uploads = [];
    const htmlfiles = files.getRecursive(cwd, "html");
    for (let f in htmlfiles) {
        //console.log(`Processing ${htmlfiles[f]}`);
        let result = parser.process(htmlfiles[f]);
        if (result.uploads) {
            //console.log(`Found uploads ${JSON.stringify(result.uploads)}`);
            uploads = uploads.concat(result.uploads);
        }
        if (result.wrapper) {
            //console.log(`Found wrapper ${JSON.stringify(result.wrapper)}`);
            wrappers.push(result.wrapper);
        }
    }
    if (uploads && uploads.length) {
        uploads = removeDuplicateUploads(uploads);
    }
    const vueFiles = files.getRecursive(cwd, "vue");
    for (let f in vueFiles) {
        //console.log(`Processing ${vueFiles[f]}`);
        let result = parser.process(vueFiles[f]);
        if (result.components) {
            //console.log(`Found component definitions ${JSON.stringify(result.components)}`);
            components = components.concat(result.components);
        }
        if (result.pages) {
            //console.log(`Found page definitions ${JSON.stringify(result.pages)}`);
            pages = pages.concat(result.pages);
        }
    }
    components = reorderComponents(components);

    const noop = () => {};
    const noComponents = _args.findIndex(a => a.toLowerCase() === "--nocomponents") > -1 || _args.findIndex(a => a.toLowerCase() === "--no-components") > -1;
    const noPages = _args.findIndex(a => a.toLowerCase() === "--nopages") > -1 || _args.findIndex(a => a.toLowerCase() === "--no-pages") > -1;
    const noWrappers = _args.findIndex(a => a.toLowerCase() === "--nowrappers") > -1 || _args.findIndex(a => a.toLowerCase() === "--no-wrappers") > -1;
    const noUploads = _args.findIndex(a => a.toLowerCase() === "--nouploads") > -1 || _args.findIndex(a => a.toLowerCase() === "--no-uploads") > -1;

    if (_args.findIndex(a => a.toLowerCase() === "--dry-run") > -1) {
        noComponents ? noop : console.log(`Components: ${components.map(c => c.name)}`);
        noPages ? noop : console.log(`Pages: ${pages.map(p => p.name)}`);
        noWrappers ? noop : console.log(`Wrappers: ${wrappers.map(w => w.name)}`);
        noUploads ? noop : console.log(`Uploads: ${uploads.map(u => u.name)}`);
    } else {
        cms.login()
        .then(() => noUploads ? noop : cms.saveUploads(uploads)) //.then((result) => console.log(JSON.stringify(result))))
        .then(() => noWrappers ? noop : cms.saveWrappers(wrappers)) //.then((result) => console.log(JSON.stringify(result))))
        .then(() => noComponents ? noop : cms.saveComponents(components)) //.then((result) => console.log(JSON.stringify(result))))
        .then(() => noPages ? noop : cms.saveTemplates(pages, wrappers.length > 0 ? wrappers[0].name : "")) //.then((result) => console.log(JSON.stringify(result))))
        ;
    }
};

const reorderComponents = (components) => {
    let workingSet = components.filter(c => c.dependencies && c.dependencies.length);
    if (!workingSet.length) return components;

    // Start with components with no dependencies
    let result = components.filter(c => !c.dependencies || !c.dependencies.length);

    while (true) {
        let processedResult = processSimpleDependencies(result, workingSet);
        if (processedResult.length === result.length) {
            // Nothing changed - exit loop
            break;
        } else {
            workingSet = components.filter(r => processedResult.findIndex(p => p.name === r.name) < 0);
            result = processedResult;
        }
    }
    if (!workingSet.length) return result;

    if (_args.findIndex(a => a.toLowerCase() === "--ignorecirculardependencies") > -1) {
        console.warn(`CMSIFY: Warning: circular dependencies found and ignored.`);
        return result.concat(workingSet);
    }

    console.error(`CMSIFY: Error: circular dependencies found. Please resolve these before importing, or set the --ignoreCircularDependencies argument.`);
    process.exit(1);
};

const processSimpleDependencies = (processedComponents, components) => {
    // Anything that depends entirely on components that are already processed can be allowed
    let simpleDependencies = components.filter(c => c.dependencies.every(d => processedComponents.findIndex(r => r.name === d) > -1));
    return processedComponents.concat(simpleDependencies);
};

const removeDuplicateUploads = (uploads) => {
    var seen = {};
    return uploads.filter(function(item) {
        return seen.hasOwnProperty(item.source) ? false : (seen[item.source] = true);
    });
}

const validateInput = (config) => {
    let ok = true;
    if (!config.CMS_INSTANCE) {
        console.error("Fatal error: CMS_INSTANCE not set");
        ok = false;
    }
    if (!config.CMS_USERNAME) {
        console.error("Fatal error: CMS_USERNAME not set");
        ok = false;
    }
    if (!config.CMS_PASSWORD) {
        console.error("Fatal error: CMS_PASSWORD not set");
        ok = false;
    }
    if (!config.CMS_API_KEY) {
        console.error("Fatal error: CMS_API_KEY not set");
        ok = false;
    }
    if (!config.CMS_SITE_ROOT) {
        console.error("Fatal error: CMS_SITE_ROOT not set");
        ok = false;
    }
    if (!config.CMS_PROJECT) {
        console.error("Fatal error: CMS_PROJECT not set");
        ok = false;
    }
    if (!config.CMS_WORKFLOW) {
        console.warn("Warning: CMS_WORKFLOW not set; defaulting to no workflow");
    }
    return ok;
};

main();