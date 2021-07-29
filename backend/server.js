const http = require('http');
const app = require('./app');
// NormalizePort returns a valid port
const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {    //if the constant "port" is not a Number
    return val;
  }
  if (port >= 0) {    //if the value of the constant "port" is greater than zero then valid: the function returns the constant port
    return port;
  }
  return false;    //otherwise (port <0) the function then returns false
};
const port = normalizePort(process.env.PORT || '3000');    //if process.env.PORT is not available then port 3000 is used
app.set('port', port);
//Error management
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':    // EACCES :  permission denied
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':    //EADDRINUSE: port already in use
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port);
