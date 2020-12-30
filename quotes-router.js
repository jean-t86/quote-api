const express = require('express');
const quotesRouter = new express.Router();

const {quotes} = require('./data');
const {getRandomElement, getIndexById, getNewId} =
 require('./utils');

quotesRouter.get('/random', (req, res, next) => {
  const randomQuote = {
    quote: getRandomElement(quotes),
  };
  res.send(randomQuote);
});

quotesRouter.get('/', (req, res, next) => {
  const person = req.query.person;
  if (person) {
    const filteredQuotes = quotes.filter((val) => val.person === person);
    res.send({quotes: filteredQuotes});
  } else {
    res.send({quotes});
  }
});

const validateQuote = (req, res, next) => {
  const quote = req.query.quote;
  const person = req.query.person;

  if (quote && person) {
    req.quote = quote;
    req.person = person;
    next();
  } else {
    res.status(400).send();
  }
};

quotesRouter.post('/', validateQuote, (req, res, next) => {
  const id = getNewId(quotes);
  const quote = {
    id,
    quote: req.quote,
    person: req.person,
  };
  quotes.push(quote);
  res.send({quote});
});

quotesRouter.param('id', (req, res, next, id) => {
  const quoteId = Number(id);
  if (quoteId) {
    const quoteIndex = getIndexById(quotes, quoteId);
    if (quoteIndex !== -1) {
      req.id = quoteId;
      req.quoteIndex = quoteIndex;
      next();
    } else {
      res.send(404).send();
    }
  } else {
    res.status(400).send();
  }
});

quotesRouter.put('/:id', validateQuote, (req, res, next) => {
  const quote = {
    id: req.id,
    quote: req.quote,
    person: req.person,
  };
  quotes[req.quoteIndex] = quote;
  res.send({quote});
});

quotesRouter.delete('/:id', (req, res, next) => {
  quotes.splice(req.quoteIndex, 1);
  res.status(204).send();
});

module.exports = quotesRouter;
