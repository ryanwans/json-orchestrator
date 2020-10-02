"use strict";

var log = require('./fancy.ts');
var branch = require('./branch.js');

var client = {
    create: function(arg) {
        if("object" != typeof arg) {
            log.warn("Argument must be an object", "Try with {name: 'fileName'}");
        }
    },
    purge: function() {

    },
    delete: function() {

    },
    print: function() {

    }
}

var io = {

};

const main = (options) => {
    console.log("Running JSON-Orchestrator CLI v1...");
    return {
        client: client,
        io: io
    }
};

module.exports = main();