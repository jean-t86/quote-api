const {assert} = require('chai');
const sinon = require('sinon');
const express = require('express');
const Server = require('../server.js');

describe('Server', function() {
  let server;

  beforeEach(function() {
    server = new Server(express);
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('Initialize app', function() {
    it('Initialises the express app by calling express()', function() {
      const expressSpy = sinon.spy();
      server = new Server(expressSpy);

      server.initialize();

      assert.ok(expressSpy.calledOnce);
    });
  });

  describe('Serves static pages', function() {
    it('calls app.use to setup the static middleware', function() {
      server.initialize();

      const appMock = sinon.mock(server._app);
      appMock.expects('use').once();

      server.serveStaticFiles();

      appMock.verify();
    });

    it('calls app.use with the correct middleware function', function() {
      server.initialize();
      const root = 'public';
      const expressSpy = sinon.spy(express, 'static');

      server.serveStaticFiles();

      assert.ok(expressSpy.calledOnce);
      assert.strictEqual(root, expressSpy.getCall(0).args[0]);
    });
  });
});
