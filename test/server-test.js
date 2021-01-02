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
  });
});
