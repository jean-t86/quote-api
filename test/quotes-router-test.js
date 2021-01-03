const {assert} = require('chai');
const express = require('express');
const morgan = require('morgan');
const request = require('supertest');
const {quotes} = require('../data.js');

const Server = require('../server.js');

describe('Quote API', function() {
  let server;

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
      const response = await request(server.app)
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
    it('returns status code 204', function(done) {
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
