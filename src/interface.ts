"use strict";

import main from "./main.js";

const cli = (that) => {
    if(that == 'create') {
        var arg = {
            name: process.env.npm_config_name,
            encoded: process.env.npm_config_encoded,
            streaming: process.env.npm_config_streaming
        };
        main.client.create(arg);
    } else {
        main.client.verbose(null);
    }
}

module.exports.cli = cli;