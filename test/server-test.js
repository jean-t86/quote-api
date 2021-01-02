const {assert} = require('chai');
const sinon = require('sinon');
const express = require('express');
const morgan = require('morgan');
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
      const expressSpy = sinon.spy();
      server = new Server(expressSpy, morgan, console);

      assert.ok(expressSpy.calledOnce);
    });
  });

  describe('Serves static pages', function() {
    it('calls app.use to setup the static middleware', function() {
      const appMock = sinon.mock(server.app);
      appMock.expects('use').once();

      server.serveStaticFiles('public');

      appMock.verify();
    });

    it('calls app.use with the correct middleware function', function() {
      const root = 'public';
      const expressSpy = sinon.spy(express, 'static');

      server.serveStaticFiles(root);

      assert.ok(expressSpy.calledOnce);
      assert.strictEqual(root, expressSpy.getCall(0).args[0]);
    });
  });

  describe('Uses morgan as console logger', function() {
    it('calls app.use to setup the morgan logger', function() {
      const appMock = sinon.mock(server.app);
      appMock.expects('use').once();

      server.setupMorgan('combined');

      appMock.verify();
    });

    it('correctly sets up the morgan logger', function() {
      const morganSpy = sinon.spy(morgan);
      server = new Server(express, morganSpy, console);
      const format = 'combined';

      server.setupMorgan(format);

      assert.ok(morganSpy.calledOnce);
      assert.strictEqual(format, morganSpy.getCall(0).args[0]);
    });
  });

  describe('Listens on the correct port', function() {
    it('calls listen() with the correct port', function() {
      const appSpy = sinon.spy(server.app, 'listen');
      const port = 4001;

      const httpServer = server.listen(port, 'asda');
      assert.ok(appSpy.calledOnce);
      assert.strictEqual(port, appSpy.getCall(0).args[0]);
      httpServer.close();
    });

    it('logs a message to the console once listen() is called', function(done) {
      const consoleSpy = sinon.spy(console, 'log');
      const port = 4002;
      consoleMsg = `Server listening on port ${port}`;

      const httpServer = server.listen(port, consoleMsg);

      httpServer.on('listening', () => {
        assert.ok(consoleSpy.calledOnce);
        assert.strictEqual(consoleMsg, consoleSpy.getCall(0).args[0]);
        httpServer.close();
        done();
      });
    });
  });

  describe('Runs the server', function() {
    it('executes calls to the server object in the right order', function() {
      const serveStaticFiles = sinon.spy(server, 'serveStaticFiles');
      const setupMorgan = sinon.spy(server, 'setupMorgan');
      const listen = sinon.spy(server, 'listen');
      const port = 4001;

      Server.run(server, port);

      assert.ok(serveStaticFiles.calledOnce);
      assert.strictEqual('public', serveStaticFiles.getCall(0).args[0]);

      assert.ok(setupMorgan.calledAfter(serveStaticFiles));
      assert.strictEqual('combined', setupMorgan.getCall(0).args[0]);

      assert.ok(listen.calledAfter(setupMorgan));
      assert.strictEqual(port, listen.getCall(0).args[0]);
      assert.strictEqual(
          `Server listening on port ${port}`,
          listen.getCall(0).args[1],
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
  });
});
