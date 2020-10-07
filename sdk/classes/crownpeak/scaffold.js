const dotenv = require("dotenv");
const fs = require("fs");
const scaffoldCore = require("crownpeak-dxm-sdk-core/lib/crownpeak/scaffold");

const processCommand = (options) => {
    const cwd = process.env.INIT_CWD || require('path').resolve('.');
    let config = process.env;
    // Merge in any environment changes they provided
    if (fs.existsSync(cwd + "/.env")) {
        Object.assign(config, dotenv.parse(fs.readFileSync(cwd + "/.env")))
    }

    // Check we have everything we need to work
    if (!scaffoldCore.validateInput(config)) return;

    const cms = require("crownpeak-dxm-sdk-core/lib/crownpeak/cms");
    cms.init(config);

    const parser = require("../parsers/parser");
    const files = require("crownpeak-dxm-sdk-core/lib/crownpeak/utils");

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
        if (result.uploads) {
            //console.log(`Found uploads ${JSON.stringify(result.uploads)}`);
            uploads = uploads.concat(result.uploads);
        }
    }
    if (uploads && uploads.length) {
        uploads = scaffoldCore.removeDuplicateUploads(uploads);
    }
    if (options.only && options.only.length) {
        components = components.filter(c => options.only.indexOf(c.name) >= 0);
        pages = pages.filter(p => options.only.indexOf(p.name) >= 0);
        wrappers = wrappers.filter(w => options.only.indexOf(w.name) >= 0);
        uploads = uploads.filter(u => options.only.indexOf(u.name) >= 0);
        // Set the --ignore-circular-dependencies to get around potential missing dependencies issues here
        if (options["ignore-circular-dependencies"] !== true && options.ignorecirculardependencies !== true) {
            options["ignore-circular-dependencies"] = 
                options.ignorecirculardependencies = 
                options["do-not-warn-about-circular-dependencies"] = true;
        }
    }

    scaffoldCore.process(cms, options, components, pages, wrappers, uploads);
};

const validate = (options) => {
    return scaffoldCore.validate(options);
};

module.exports = {
    process: processCommand,
    validate: validate
};