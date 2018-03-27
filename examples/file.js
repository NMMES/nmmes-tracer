#!/usr/bin/env node

const Tracer = require('../');

const logger = new Tracer.Logger({
    transports: [
        new Tracer.transports.Console(),
        new Tracer.transports.File({
            path: './output.json',
            format: (...args) => { // This is a trailing bind of JSON.stringify so we get pretty print
                return JSON.stringify(...args, null, 2);
            }
        }),
        new Tracer.transports.File({
            path: './output.log'
        }),
    ]
});

logger.log('test', ['array'], {
    nested: {
        obj: true
    }
});
