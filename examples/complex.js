#!/usr/bin/env node

const Tracer = require('../');
const chalk = require('chalk');
const strip = require('strip-ansi');

const logger = new Tracer.Logger({
    levels: ['trace', 'debug', 'log', 'info', 'warn', 'error', 'fatal'],
    level: 'debug',
    dateformat: 'X',
    format: ["<{{=it.title}}>{{?it.context}} {{=it.context}}{{?}} {{=it.message}}",
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
                warn: chalk.yellow,
                fatal: chalk.red
            }
        }),
        // new Tracer.transports.Console({
        //     format: JSON.stringify
        // })
    ],
    postprocessor: function(str) {
        str += ' ';
        str += '-'.repeat(Math.max(79 - strip(str).length, 0));
        return str;
    },
});

async function sampleFunction() {
    logger.trace("I will not display because the log level is set to debug");
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
    console.log("Displayed before logger has finished writing");
    await logger.flush(); // wait for logger to finish writing
    console.log("Logger has finished writing");
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
    }, 'meh its ok, I just replaced the last msg');

    let contextedLogger = logger.new({contextualLogger: true});

    contextedLogger.log('this is a message from the contextual logger');
    contextedLogger.new({nested: "context"}).log('oh god no!');

    logger.info("Original logger was uneffected by contextual logger");
}

sampleFunction();
