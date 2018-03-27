#!/usr/bin/env node

const Tracer = require('../');
const PassThrough = require('stream').PassThrough;

const passthroughPipe = new PassThrough();

const logger = new Tracer.Logger({
    transports: [
        new Tracer.transports.Raw({
            function: (string, ops, details) => {
                passthroughPipe.write(string+'\n');
            }
        })
    ]
});

logger.log('test', ['array'], {
    nested: {
        obj: true
    }
});

passthroughPipe.on('data', chunk => {
    process.stdout.write('Stream output: '+chunk.toString('utf8'));
});
