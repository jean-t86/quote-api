const {assert} = require('chai');
const sinon = require('sinon');
const express = require('express');
const morgan = require('morgan');

const Server = require('../server.js');

describe('Server', function() {
  let server;

  beforeEach(function() {
    server = new Server(express, morgan, console);
  });

  afterEach(function() {
    sinon.restore();
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
      const appMock = sinon.mock(server._app);
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
      const appMock = sinon.mock(server._app);
      appMock.expects('use').once();

      server.setupMorgan();

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
      const appMock = sinon.mock(server._app);
      const port = 4001;
      appMock.expects('listen').once().withArgs(port);

      server.listen(port, '');

      appMock.verify();
    });

    it('logs a message to the console once listen() is called', function(done) {
      const consoleSpy = sinon.spy(console, 'log');
      const port = 4002;
      consoleMsg = `Server listening on port ${port}`;

      const httpServer = server.listen(port, consoleMsg);

      httpServer.on('listening', () => {
        assert.ok(consoleSpy.calledOnce);
        assert.strictEqual(consoleMsg, consoleSpy.getCall(0).args[0]);
        done();
      });
    });
  });
});
