const {assert} = require('chai');
const sinon = require('sinon');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const {quotes} = require('../data.js');
const quotesRouter = require('../quotes-router.js');

const Server = require('../server.js');

describe('Server', function() {
  let server;

  beforeEach(function() {
    server = new Server(express, morgan, console, [...quotes]);
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('Initialize app in constructor', function() {
    it('initialises the express app by calling express()', function() {
      const spyExpress = sinon.spy();
      server = new Server(spyExpress, morgan, console, [...quotes]);

      assert.ok(spyExpress.calledOnce);
    });
  });

  describe('Serves static pages', function() {
    it('calls app.use to setup the static middleware', function() {
      const mockApp = sinon.mock(server.app);
      mockApp.expects('use').once();

      server.serveStaticFiles('public');

      mockApp.verify();
    });

    it('calls app.use with the correct middleware function', function() {
      const root = 'public';
      const spyExpress = sinon.spy(express, 'static');

      server.serveStaticFiles(root);

      assert.ok(spyExpress.calledOnce);
      assert.strictEqual(root, spyExpress.getCall(0).args[0]);
    });
  });

  describe('Uses morgan as console logger', function() {
    it('calls app.use to setup the morgan logger', function() {
      const mockApp = sinon.mock(server.app);
      mockApp.expects('use').once();

      server.setupMorgan('combined');

      mockApp.verify();
    });

    it('correctly sets up the morgan logger', function() {
      const spyMorgan = sinon.spy(morgan);
      server = new Server(express, spyMorgan, console, [...quotes]);
      const format = 'combined';

      server.setupMorgan(format);

      assert.ok(spyMorgan.calledOnce);
      assert.strictEqual(format, spyMorgan.getCall(0).args[0]);
    });
  });

  describe('Uses a json body parser', function() {
    it('call app.use to use the middleware', function() {
      const mockApp = sinon.mock(server.app);
      mockApp.expects('use').once();

      server.setupBodyParser(bodyParser.json);

      mockApp.verify();
    });

    it('sets app to use body-parser.json', function() {
      const spyBodyParser = sinon.spy(bodyParser.json);
      server = new Server(express, morgan, console, [...quotes]);

      server.setupBodyParser(spyBodyParser);

      assert.ok(spyBodyParser.calledOnce);
    });
  });

  describe('Listens on the correct port', function() {
    it('calls listen() with the correct port', function(done) {
      const spyApp = sinon.spy(server.app, 'listen');
      const port = 4001;

      const httpServer = server.listen(port, 'asda');
      assert.ok(spyApp.calledOnce);
      assert.strictEqual(port, spyApp.getCall(0).args[0]);
      httpServer.close(done);
    });

    it('logs a message to the console once listen() is called', function(done) {
      const spyConsole = sinon.spy(console, 'log');
      const port = 4001;
      consoleMsg = `Server listening on port ${port}`;

      const httpServer = server.listen(port, consoleMsg);

      httpServer.on('listening', () => {
        assert.ok(spyConsole.calledOnce);
        assert.strictEqual(consoleMsg, spyConsole.getCall(0).args[0]);
        httpServer.close(done);
      });
    });
  });

  describe('Runs the server', function() {
    it('executes calls to the server in the right order', function(done) {
      const spyServeStaticFiles = sinon.spy(server, 'serveStaticFiles');
      const spySetupMorgan = sinon.spy(server, 'setupMorgan');
      const spySetupBodyParser = sinon.spy(server, 'setupBodyParser');
      const spySetupRouter = sinon.spy(server, 'setupRouter');
      const spyListen = sinon.spy(server, 'listen');
      const port = 4001;

      Server.run(server, port);

      assert.ok(spyServeStaticFiles.calledOnce);
      assert.strictEqual('public', spyServeStaticFiles.getCall(0).args[0]);

      assert.ok(spySetupMorgan.calledAfter(spyServeStaticFiles));
      assert.strictEqual('combined', spySetupMorgan.getCall(0).args[0]);

      assert.ok(spySetupBodyParser.calledAfter(spySetupMorgan));
      assert.deepEqual(bodyParser.json, spySetupBodyParser.getCall(0).args[0]);

      assert.ok(spySetupRouter.calledAfter(spySetupBodyParser));
      assert.strictEqual('/api/quotes', spySetupRouter.getCall(0).args[0]);
      assert.deepEqual(quotesRouter, spySetupRouter.getCall(0).args[1]);

      assert.ok(spyListen.calledAfter(spySetupRouter));
      assert.strictEqual(port, spyListen.getCall(0).args[0]);
      assert.strictEqual(
          `Server listening on port ${port}`,
          spyListen.getCall(0).args[1],
      );

      server.close(done);
    });
  });

  describe('Closes the server connection', function() {
    it('close() returns false if server is not listening', function(done) {
      const isClosed = server.close(done);
      if (!isClosed) done();

      assert.ok(!isClosed);
    });

    it('close() returns true if the server was listening', function(done) {
      server.listen(4001, '');

      const isClosed = server.close(done);

      assert.ok(isClosed);
    });
  });

  describe('Sets up quotes router', function() {
    it('calls app.use() to setup quotesRouter middleware', function() {
      const mockApp = sinon.mock(server.app);
      mockApp.expects('use').once();

      server.setupRouter('/api/quotes', quotesRouter);

      mockApp.verify();
    });

    it('call app.use with the correct route', function() {
      const spyApp = sinon.spy(server.app, 'use');

      server.setupRouter('/api/quotes', quotesRouter);

      assert.ok(spyApp.calledOnce);
      assert.strictEqual('/api/quotes', spyApp.getCall(0).args[0]);
    });

    it('calls the quotesRouter function as a middleware', function() {
      const spyQuotesRouter = sinon.spy(quotesRouter);
      server = new Server(express, morgan, console, [...quotes]);

      server.setupRouter('/api/quotes', spyQuotesRouter);

      assert.ok(spyQuotesRouter.calledOnce);
    });
  });
});
