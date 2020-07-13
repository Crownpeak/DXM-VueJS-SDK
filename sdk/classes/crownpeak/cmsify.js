#!/usr/bin/env node
const dotenv = require("dotenv");
const fs = require("fs");

const _args = process.argv.slice(2);

const main = () => {
    if (_args.findIndex(a => a.toLowerCase() === "--help") > -1
        || _args.findIndex(a => a.toLowerCase() === "-h") > -1) {
        return showHelp();
    }

    const cwd = process.env.INIT_CWD || require('path').resolve('.');
    let config = process.env;
    // Merge in any environment changes they provided
    if (fs.existsSync(cwd + "/.env")) {
        Object.assign(config, dotenv.parse(fs.readFileSync(cwd + "/.env")))
    }

    // Check we have everything we need to work
    if (!validateInput(config)) return;

    const cms = require("crownpeak-dxm-sdk-core/lib/crownpeak/cms");
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
    } else if (_args.findIndex(a => a.toLowerCase() === "--verify") > -1) {
        cms.login()
        .then(() => cms.verifyEnvironment())
        ;
    } else {
        cms.login()
        .then(() => noUploads ? noop : cms.saveUploads(uploads))
        .then(() => noWrappers ? noop : cms.saveWrappers(wrappers))
        .then(() => noComponents ? noop : cms.saveComponents(components))
        .then(() => noPages ? noop : cms.saveTemplates(pages, wrappers.length > 0 ? wrappers[0].name : ""))
        ;
    }
};

const showHelp = () => {
    const isYarn = typeof(process.env["YARN_WRAP_OUTPUT"]) !== "undefined";
    const isNpx = typeof(process.env["NPX_CLI_JS"]) !== "undefined";
    const proc = isYarn ? "yarn" : "npx";
    process.stdout.write("To assist the Single Page App developer in developing client-side applications that leverage DXM for content management purposes.\n\n");
    process.stdout.write(proc + " crownpeak [--dry-run] [--verify] [--ignore-circular-dependencies] [--no-components] [--no-pages] [--no-pages] [--no-uploads]\n\n");
    process.stdout.write("Arguments\n");
    process.stdout.write("---------\n");
    process.stdout.write("--dry-run                      - Show what would be created/updated inside the DXM platform if --dry-run were not specified.\n");
    process.stdout.write("--verify                       - Verify that the Crownpeak DXM environment is configurated correctly.\n");
    process.stdout.write("--ignore-circular-dependencies - Instruct the tool to ignore unmet/circular dependency checking before import.\n");
    process.stdout.write("                                 Errors may be shown when the tool is run if dependencies do not exist within DXM.\n");
    process.stdout.write("--no-components                - Instruct the tool to not create/update components within the DXM platform.\n");
    process.stdout.write("--no-pages                     - Instruct the tool to not create/update templates, models or pages within the DXM platform.\n");
    process.stdout.write("--no-wrappers                  - Instruct the tool to not create/update wrappers within the DXM platform.\n");
    process.stdout.write("--no-uploads                   - Instruct the tool to not create/update uploads within the DXM platform.\n");
    process.stdout.write("\n");
    process.stdout.write("A number of environment variables are expected when running this tool. These can be set directly or provided via a .env file.\n\n");
    process.stdout.write("Environment variables\n");
    process.stdout.write("---------------------\n");
    process.stdout.write("CMS_INSTANCE                 - The CMS instance name to use.\n");
    process.stdout.write("CMS_USERNAME                 - The username to access the selected CMS instance.\n");
    process.stdout.write("CMS_PASSWORD                 - The password to access the selected CMS instance.\n");
    process.stdout.write("CMS_API_KEY                  - The developer key to use with the CMS Access API.\n");
    process.stdout.write("CMS_SITE_ROOT                - The asset id of the site root in which content items should be created.\n");
    process.stdout.write("CMS_PROJECT                  - The asset id of the project in which code items should be created.\n");
    process.stdout.write("CMS_WORKFLOW                 - The id of the workflow with which content items should be associated.\n");
    process.stdout.write("CMS_STATIC_CONTENT_LOCATION  - The folder in your project where static JSON files can be found.\n");
    process.stdout.write("CMS_DYNAMIC_CONTENT_LOCATION - A Search G2 query prefix that can be used to locate dynamic content.\n");
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

    if (_args.findIndex(a => a.toLowerCase() === "--ignorecirculardependencies") > -1
        || _args.findIndex(a => a.toLowerCase() === "--ignore-circular-dependencies") > -1) {
        console.warn(`CMSIFY: Warning: circular dependencies found and ignored.`);
        return result.concat(workingSet);
    }

    console.error(`CMSIFY: Error: circular dependencies found. Please resolve these before importing, or set the --ignore-circular-dependencies argument.`);
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