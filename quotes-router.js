const express = require('express');
const {getRandomElement, getElementById, getIndexById} = require('./utils.js');

module.exports = function(quotes) {
  const quotesRouter = new express.Router();

  quotesRouter.get('/random', (req, res) => {
    const quote = getRandomElement(quotes);
    res.status(200).send({quote});
  });

  quotesRouter.get('/', (req, res) => {
    res.status(200).send({quotes: quotes});
  });

  quotesRouter.param('quoteId', (req, res, next, quoteId) => {
    const id = Number(quoteId);
    if (id) {
      const quote = getElementById(quotes, id);
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

  quotesRouter.get('/:quoteId', (req, res) => {
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

  quotesRouter.put('/:quoteId', validateQuote, (req, res) => {
    const quote = {
      id: req.quoteId,
      quote: req.body.quote.quote,
      person: req.body.quote.person,
    };
    const index = getIndexById(quotes, req.quoteId);
    quotes[index] = quote;
    res.status(200).send({quote});
  });

  quotesRouter.delete('/:quoteId', (req, res) => {
    const index = getIndexById(quotes, req.quoteId);
    const deleted = quotes.splice(index, 1);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).send();
    }
  });

  return quotesRouter;
};
