#!/usr/bin/env node

const Tracer = require('../');

const logger = new Tracer.Logger({
    transports: [
        new Tracer.transports.Console()
    ]
});

logger.log('test', ['array'], {
    nested: {
        obj: true
    }
});
