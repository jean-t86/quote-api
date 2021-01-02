const {assert} = require('chai');
const sinon = require('sinon');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const request = require('supertest');

const Server = require('../server.js');

describe('Server', function() {
  let server;

  beforeEach(function() {
    server = new Server(express, morgan, console);
  });

  afterEach(function() {
    sinon.restore();
    server.close();
  });

  describe('Initialize app in constructor', function() {
    it('initialises the express app by calling express()', function() {
      const spyExpress = sinon.spy();
      server = new Server(spyExpress, morgan, console);

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
      server = new Server(express, spyMorgan, console);
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
      server = new Server(express, morgan, console);

      server.setupBodyParser(spyBodyParser);

      assert.ok(spyBodyParser.calledOnce);
    });
  });

  describe('Listens on the correct port', function() {
    it('calls listen() with the correct port', function() {
      const spyApp = sinon.spy(server.app, 'listen');
      const port = 4001;

      const httpServer = server.listen(port, 'asda');
      assert.ok(spyApp.calledOnce);
      assert.strictEqual(port, spyApp.getCall(0).args[0]);
      httpServer.close();
    });

    it('logs a message to the console once listen() is called', function(done) {
      const spyConsole = sinon.spy(console, 'log');
      const port = 4002;
      consoleMsg = `Server listening on port ${port}`;

      const httpServer = server.listen(port, consoleMsg);

      httpServer.on('listening', () => {
        assert.ok(spyConsole.calledOnce);
        assert.strictEqual(consoleMsg, spyConsole.getCall(0).args[0]);
        httpServer.close();
        done();
      });
    });
  });

  describe('Runs the server', function() {
    it('executes calls to the server object in the right order', function() {
      const spyServeStaticFiles = sinon.spy(server, 'serveStaticFiles');
      const spySetupMorgan = sinon.spy(server, 'setupMorgan');
      const spyListen = sinon.spy(server, 'listen');
      const port = 4001;

      Server.run(server, port);

      assert.ok(spyServeStaticFiles.calledOnce);
      assert.strictEqual('public', spyServeStaticFiles.getCall(0).args[0]);

      assert.ok(spySetupMorgan.calledAfter(spyServeStaticFiles));
      assert.strictEqual('combined', spySetupMorgan.getCall(0).args[0]);

      assert.ok(spyListen.calledAfter(spySetupMorgan));
      assert.strictEqual(port, spyListen.getCall(0).args[0]);
      assert.strictEqual(
          `Server listening on port ${port}`,
          spyListen.getCall(0).args[1],
      );
    });
  });

  describe('Closes the server connection', function() {
    it('close() returns false if server is not listening', function() {
      const isClosed = server.close();

      assert.ok(!isClosed);
    });

    it('close() returns true if the server was listening', function() {
      server.listen(4001, '');

      const isClosed = server.close();

      assert.ok(isClosed);
    });
  });

  describe('GET random quote', function() {
    beforeEach(function() {
      Server.run(server, 4001);
    });

    afterEach(function(done) {
      server.close(done);
    });

    describe('GET random quote', function() {
      it('returns status code 200', function(done) {
        request(server.app)
            .get('/api/quotes/random')
            .expect(200, done);
      });

      it('returns a random quote', function(done) {
        request(server.app)
            .get('/api/quotes/random')
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              const quote = res.body.quote;
              assert.ok(quote.id !== undefined);
              assert.ok(quote.quote !== undefined);
              assert.ok(quote.person !== undefined);
              done();
            });
      });
    });

    describe('Get all quotes', function() {
      it('returns status code 200', function(done) {
        request(server.app)
            .get('/api/quotes')
            .expect(200, done);
      });

      it('returns all quotes', function(done) {
        request(server.app)
            .get('/api/quotes')
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              const quotes = res.body.quotes;
              assert.ok(quotes.length > 0);
              done();
            });
      });
    });

    describe('Get quote by id', function() {
      it('returns status code 200', function(done) {
        request(server.app)
            .get('/api/quotes/1')
            .expect(200, done);
      });

      it('returns quote with passed in id', function(done) {
        const id = 1;
        request(server.app)
            .get(`/api/quotes/${id}`)
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              const quote = res.body.quote;
              assert.ok(quote.id !== undefined);
              assert.ok(quote.quote !== undefined);
              assert.ok(quote.person !== undefined);
              done();
            });
      });

      it('returns 404 when the id is not found', function(done) {
        const id = 30;
        request(server.app)
            .get(`/api/quotes/${id}`)
            .expect(404, done);
      });

      it('returns 400 when the id is not a number', function(done) {
        const id = 'string';
        request(server.app)
            .get(`/api/quotes/${id}`)
            .expect(400, done);
      });
    });
  });
});
