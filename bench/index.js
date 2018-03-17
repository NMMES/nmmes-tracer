const Tracer = require('../');

const logger = new Tracer.Logger({
    transports: [
        new Tracer.transports.Console()
    ]
});

const Benchmark = require('benchmark');
const suite = new Benchmark.Suite;
let cycles = [];

suite
    .add('Native', () => {
        console.log('bench');
    })
    .add('log', () => {
        logger.log('bench');
    })
    .on('cycle', event => {
        cycles.push(String(event.target))
    })
    .on('complete', async () => {
        await logger.flush();
        for (const cycle of cycles) {
            console.log(cycle);
        }
    })
    .run({ 'async': true });