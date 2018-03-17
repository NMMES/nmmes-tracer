# NMMES-tracer
---

Inspired by [tracer](https://github.com/baryon/tracer) but with the following in mind.
- ES6 syntax
- Simplified infrastructure
- Async transports so applications are never blocked

NMMES-tracer does a few things better than tracer in my opinion, these include
- Highly reactive to changed settings (change anything on the fly)
- More powerful templating language using [dot](https://olado.github.io/doT/index.html)
- More powerful datetime formating using [moment](https://momentjs.com/)

NMMES-tracer also keeps the things tracer did so well
- Stacktrace debug information

## Usage
```
const Tracer = require('nmmes-tracer');

const logger = new Tracer.Logger({
    transports: [
        new Tracer.transports.Console()
    ]
});

logger.log('hello world!');
```

See [examples directory](https://github.com/NMMES/nmmes-tracer/tree/master/examples) for examples.
