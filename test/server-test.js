const {assert} = require('chai');
const sinon = require('sinon');

describe('Server', function() {
  let express;
  let server;

  beforeEach(function() {
    express = require('express');
    server = new Server(express);
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('Initialize app', function() {
    it('Initialises the express app by calling express()', function() {
      sinon.spy(express);

      server.initialize();

      assert.ok(express.calledOnce);
    });
  });
});
