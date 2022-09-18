'use strict'
const http = require('http'),
      debug = require('debug')('apic:server');

const normalizePort = val => {
    let port = parseInt(val, 10);
    if(isNaN(port)) {
        return val;
    }
    if(port >= 0) {
        return port;
    }
    return false;
}

exports.Run = app => {
    let server = http.createServer(app);
    let port = normalizePort(process.env.PORT);
    app.set('port', port);
    server.listen(port);
    server.on('error', error => {
        if(error.syscall !== 'listen') {
            throw error;
        }
        let bind = typeof port === 'listen' ? 'pipe ' + port : 'port ' + port;
        switch(error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    });
    server.on('listening', () => {
        let addr = server.address();
        let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
        debug('listening on ' + bind);
    });
}