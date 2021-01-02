/**
 * The Server class used to encapsulate the node.js web server
 */
class Server {
  /**
   * Constructor for the Server class
   * @param {express} express The express web framework
   */
  constructor(express) {
    this._express = express;
  }

  /**
   * Initializes the web server
   */
  initialize() {
    this._app = this._express();
  }
}

module.exports = Server;
