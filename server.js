const express = require('express');
const morgan = require('morgan');

/**
 * The Server class used to encapsulate the node.js web server
 */
class Server {
  /**
   * Constructor for the Server class
   * @param {express} express The express web framework
   * @param {morgan} morgan The morgan logger middleware
   * @param {console} console The console
   */
  constructor(express, morgan, console) {
    this._express = express;
    this._morgan = morgan;
    this._console = console;
    this._app = express();
  }

  /**
   * Instructs the Server to serve static files
   * @param {String} root The root path from which to serve static files
   */
  serveStaticFiles(root) {
    this._app.use(this._express.static(root));
  }

  /**
   * Setup the morgan logger to be used by the Server
   * @param {string} format The format to use by the morgan logger
   */
  setupMorgan(format) {
    this._app.use(this._morgan(format));
  }

  /**
   * Listens for incoming requests to the web server
   * @param {number} port The port number on which to listen
   * @param {logMsg} logMsg The message to log once the Server starts listening
   * @return {http.Server} The http server that was created
   */
  listen(port, logMsg) {
    return this._app.listen(port, () => {
      this._console.log(logMsg);
    });
  }
}

module.exports = Server;
