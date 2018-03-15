#!/usr/bin/env node

const Tracer = require('../');
const chalk = require('chalk');

const logger = new Tracer.Logger({
    levels: ['trace', 'debug', 'log', 'info', 'warn', 'error', 'fatal'],
    level: 'log',
    format: ["<{{=it.title}}> {{=it.message}}",
        {
            debug: "<{{=it.title}}> {{=it.timestamp}} [{{=it.file}}:{{=it.line}}] {{=it.message}}",
            trace: "<{{=it.title}}> {{=it.timestamp}} ({{=it.method}}) [{{=it.file}}:{{=it.line}}] {{=it.message}}"
        }
    ],
    transports: [
        new Tracer.transports.Console({
            format: {
                warn: "A WARNING from console: {{=it.message}}"
            },
            filters: {
                fatal: chalk.red
            }
        }),
        // new Tracer.transports.Console({
        //     format: JSON.stringify
        // })
    ]
});

function sampleFunction() {
    logger.trace(1, 'test', ['array'], {
        nested: {
            obj: true
        }
    });
    logger.debug('test', ['array'], {
        nested: {
            obj: true
        }
    });
    logger.log('test', ['array'], {
        nested: {
            obj: true
        }
    });
    logger.info('test', ['array'], {
        nested: {
            obj: true
        }
    });
    logger.warn('test', ['array'], {
        nested: {
            obj: true
        }
    });
    logger.error('test', ['array'], {
        nested: {
            obj: true
        }
    });
    logger.fatal('test', ['array'], {
        nested: {
            obj: true
        }
    });

    logger.fatal({
        __tracer_ops: true,
        id: 'dieing'
    }, 'THERE HAS BEEN A FATAL ERROR');
    logger.warn({
        __tracer_ops: true,
        replace: true,
        id: 'dieing'
    }, 'meh its ok')
}

sampleFunction();
