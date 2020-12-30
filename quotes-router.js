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

quotesRouter.post('/', (req, res, next) => {
  const quote = req.query.quote;
  const person = req.query.person;
  if (quote && person) {
    const id = getNewId(quotes);
    quotes.push({id, quote, person});
    res.send({quote: {id, quote, person}});
  } else {
    res.status(400).send();
  }
});

quotesRouter.put('/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const quote = req.query.quote;
  const person = req.query.person;
  if (!id || !quote || !person) res.status(400).send();

  const index = getIndexById(quotes, id);
  if (index === -1) res.status(404).send();

  const newQuote = {
    id,
    quote,
    person,
  };
  quotes[index] = newQuote;
  res.send({quote: newQuote});
});

quotesRouter.delete('/:id', (req, res, next) => {
  const id = Number(req.params.id);
  if (!id) {
    res.status(400).send();
    return;
  }

  const index = getIndexById(quotes, id);
  if (index === -1) {
    res.status(404).send();
    return;
  }

  quotes.splice(index, 1);
  res.status(204).send();
});

module.exports = quotesRouter;
