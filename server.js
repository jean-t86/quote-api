const bodyParser = require('body-parser');
const quotesRouter = require('./quotes-router.js');

/**
 * The Server class used to encapsulate the node.js web server
 */
class Server {
  /**
   * Constructor for the Server class
   * @param {express} express The express web framework
   * @param {morgan} morgan The morgan logger middleware
   * @param {console} console The console
   * @param {array} quotes The array of quotes
   */
  constructor(express, morgan, console, quotes) {
    this._express = express;
    this._morgan = morgan;
    this._console = console;
    this._quotes = quotes;
    this._app = express();
  }

  /**
   * Getter method for this._app
   */
  get app() {
    return this._app;
  }

  /**
   * Getter method for this._quotes
   */
  get quotes() {
    return this._quotes;
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
   * Setup the body parse to use for req.body
   * @param {NextHandleFunction} bodyParser The parser to use to parse the
   * req.body
   */
  setupBodyParser(bodyParser) {
    this._app.use(bodyParser());
  }

  /**
   * Setup the quotes router
   * @param {string} path The path of the route
   * @param {function} router A function that returns the router
   */
  setupRouter(path, router) {
    this._app.use(path, router(this._quotes));
  }

  /**
   * Listens for incoming requests to the web server
   * @param {number} port The port number on which to listen
   * @param {logMsg} logMsg The message to log once the Server starts listening
   * @return {http.Server} The http server that was created
   */
  listen(port, logMsg) {
    this._httpServer = this._app.listen(port, () => {
      this._console.log(logMsg);
    });
    return this._httpServer;
  }

  /**
   * Closes the server's connection
   * @param {CallbackHandler} done The async callback required when unit testing
   * @return {boolean} true if the http server was succesfully closed, false
   * otherwise
   */
  close(done) {
    if (this._httpServer) {
      this._httpServer.close(done);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Runs the server
   * @param {Server} server The server to run
   * @param {number} port The port to which the server should listen to
   */
  static run(server, port) {
    server.serveStaticFiles('public');
    server.setupMorgan('combined');
    server.setupBodyParser(bodyParser.json);
    server.setupRouter('/api/quotes', quotesRouter);
    server.listen(port, `Server listening on port ${port}`);
  }
}

module.exports = Server;
