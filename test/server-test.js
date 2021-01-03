const {assert} = require('chai');
const sinon = require('sinon');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const request = require('supertest');
const {quotes} = require('../data.js');

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
      server = new Server(spyExpress, morgan, console, quotes);

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
      server = new Server(express, spyMorgan, console, quotes);
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
      server = new Server(express, morgan, console, quotes);

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
      const spyListen = sinon.spy(server, 'listen');
      const port = 4001;

      Server.run(server, port);

      assert.ok(spyServeStaticFiles.calledOnce);
      assert.strictEqual('public', spyServeStaticFiles.getCall(0).args[0]);

      assert.ok(spySetupMorgan.calledAfter(spyServeStaticFiles));
      assert.strictEqual('combined', spySetupMorgan.getCall(0).args[0]);

      assert.ok(spySetupBodyParser.calledAfter(spySetupMorgan));
      assert.deepEqual(bodyParser.json, spySetupBodyParser.getCall(0).args[0]);

      assert.ok(spyListen.calledAfter(spySetupBodyParser));
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

  describe('Quote API', function() {
    beforeEach(function() {
      server = new Server(express, morgan, console, [...quotes]);
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

    describe('Put to update an existing quote', function() {
      it('returns status code 200', function(done) {
        request(server.app)
            .put('/api/quotes/1')
            .send({
              quote: {
                id: 1,
                quote: 'Update this quote',
                person: 'Me',
              },
            })
            .expect(200, done);
      });

      it('updates an existing quote', async function() {
        // Get a random quote and update it
        await request(server.app)
            .get('/api/quotes/random');
        const id = response.body.quote.id;
        const quote = {
          id,
          quote: 'A new quote',
          person: 'me',
        };

        // Call put to update the quote on the server
        await request(server.app)
            .put(`/api/quotes/${id}`)
            .send({quote})
            .expect(200);

        // Checks that the quote has been updated on the server
        await request(server.app)
            .get(`/api/quotes/${id}`)
            .expect(200)
            .then((res) => {
              const updatedQuote = res.body.quote;
              assert.strictEqual(quote.id, updatedQuote.id);
              assert.strictEqual(quote.quote, updatedQuote.quote);
              assert.strictEqual(quote.person, updatedQuote.person);
            });
      });

      it('returns 404 when the id is not found', function(done) {
        const id = 30;
        request(server.app)
            .put(`/api/quotes/${id}`)
            .expect(404, done);
      });

      it('returns 400 when the id is not a number', function(done) {
        const id = 'string';
        request(server.app)
            .put(`/api/quotes/${id}`)
            .expect(400, done);
      });

      it('returns 400 if put with an invalid quote', function(done) {
        request(server.app)
            .put('/api/quotes/1')
            .send({
              quote: {
                id: 1,
                quote: '',
                person: '',
              },
            })
            .expect(400, done);
      });
    });

    describe('Delete a quote', function() {
      it('returns status code 200', function(done) {
        request(server.app)
            .delete('/api/quotes/2')
            .expect(204, done);
      });

      it('returns 404 if quote is not found', function(done) {
        request(server.app)
            .delete('/api/quotes/21')
            .expect(404, done);
      });

      it('removes the deleted quote', async function() {
        const id = 2;
        await request(server.app)
            .delete(`/api/quotes/${id}`)
            .expect(204);

        await request(server.app)
            .get(`/api/quotes/${id}`)
            .expect(404);
      });
    });
  });
});
