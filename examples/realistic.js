#!/usr/bin/env node

const Tracer = require('../');
const chalk = require('chalk');

const logger = new Tracer.Logger({
    levels: ['trace', 'debug', 'log', 'info', 'warn', 'error', 'fatal'],
    level: 'trace',
    dateformat: 'llll',
    format: ["<{{=it.title}}> {{=it.message}}",
        {
            debug: "<{{=it.title}}> {{=it.timestamp}} [{{=it.file}}:{{=it.line}}] {{=it.message}}",
            trace: "<{{=it.title}}> {{=it.timestamp}} ({{=it.method}}) [{{=it.file}}:{{=it.line}}] {{=it.message}}"
        }
    ],
    filters: {
        trace: chalk.magenta,
        debug: chalk.blue,
        info: chalk.green,
        warn: chalk.yellow,
        error: chalk.red,
        fatal: chalk.bgRed
    },
    preprocessor: (data, ops) => {
        if (data.level >= 6) {
            data.message.unshift('⚠️');
            data.message.push('⚠️');
        }
        return [data, ops];
    },
    transports: [
        new Tracer.transports.Console(),
    ]
});

async function sampleFunction() {
    logger.trace('SSL connection initialized');
    logger.debug('Attempting to connect to:', {host: "hostname.com", port: 2212});
    logger.log('System started');
    logger.info('Modules initialized:', ['Red One', 'Blue Two', 'Blackburn']);
    logger.warn('Reconnection attempt:', 5);
    logger.error('Reactor tempature above nominal!');
    logger.fatal('Failed to connect to emergency cooling systems, overload protocol initialized...');
}

sampleFunction();
