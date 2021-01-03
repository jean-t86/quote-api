const {getRandomElement, getElementById, getIndexById} = require('./utils.js');
const bodyParser = require('body-parser');

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

    server.app.get('/api/quotes/random', (req, res) => {
      const quote = getRandomElement(server.quotes);
      res.status(200).send({quote});
    });

    server.app.get('/api/quotes', (req, res) => {
      res.status(200).send({quotes: server.quotes});
    });

    server.app.param('quoteId', (req, res, next, quoteId) => {
      const id = Number(quoteId);
      if (id) {
        const quote = getElementById(server.quotes, id);
        if (quote) {
          req.quoteId = id;
          req.quote = {quote};
          next();
        } else {
          res.status(404).send();
        }
      } else {
        res.status(400).send();
      }
    });

    server.app.get('/api/quotes/:quoteId', (req, res) => {
      res.status(200).send(req.quote);
    });

    const validateQuote = (req, res, next) => {
      const quote = req.body.quote;
      if (quote.id && quote.quote && quote.person) {
        next();
      } else {
        res.status(400).send();
      }
    };

    server.app.put('/api/quotes/:quoteId', validateQuote, (req, res) => {
      const quote = {
        id: req.quoteId,
        quote: req.body.quote.quote,
        person: req.body.quote.person,
      };
      const index = getIndexById(server.quotes, req.quoteId);
      server.quotes[index] = quote;
      res.status(200).send({quote});
    });

    server.app.delete('/api/quotes/:quoteId', (req, res) => {
      const index = getIndexById(server.quotes, req.quoteId);
      const deleted = server.quotes.splice(index, 1);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).send();
      }
    });

    server.listen(port, `Server listening on port ${port}`);
  }
}

module.exports = Server;
