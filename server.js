/**
 * The Server class used to encapsulate the node.js web server
 */
class Server {
  /**
   * Constructor for the Server class
   * @param {express} express The express web framework
   * @param {morgan} morgan The morgan logger middleware
   */
  constructor(express, morgan) {
    this._express = express;
    this._morgan = morgan;
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
}

module.exports = Server;
