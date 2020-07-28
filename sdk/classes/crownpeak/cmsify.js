#!/usr/bin/env node

const arguments = require("crownpeak-dxm-sdk-core/lib/crownpeak/arguments");
const init = require("crownpeak-dxm-sdk-core/lib/crownpeak/init");
const patch = require("crownpeak-dxm-sdk-core/lib/crownpeak/patch");
const scaffold = require("./scaffold");
const utils = require("crownpeak-dxm-sdk-core/lib/crownpeak/utils");

const main = (args) => {
    utils.colouriseErrors();
    const options = arguments.parse(args);
    const verb = options._.length > 0 ? options._[0] : "";
    if (options.help === true) 
        return arguments.showHelp(verb);

    switch (verb) {
        case "init":
            if (!init.validate(options)) return false;
            return init.process(options);
        case "patch":
            if (!patch.validate(options)) return false;
            return patch.process(options);
        case "scaffold":
            if (!scaffold.validate(options)) return false;
            return scaffold.process(options);
    }
    return arguments.showUsage();
};

main(process.argv.slice(2));