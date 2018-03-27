#!/usr/bin/env node

const Tracer = require('../');
const PassThrough = require('stream').PassThrough;

const passthroughPipe = new PassThrough();

const logger = new Tracer.Logger({
    transports: [
        new Tracer.transports.Stream({
            pipe: passthroughPipe
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
