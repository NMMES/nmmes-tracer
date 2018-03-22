#!/usr/bin/env node

const Tracer = require('../');

const logger = new Tracer.Logger({
    transports: [
        new Tracer.transports.Console(),
        new Tracer.transports.File({
            path: './output.log',
            format: JSON.stringify
        }),
    ]
});

logger.log('test', ['array'], {
    nested: {
        obj: true
    }
});
