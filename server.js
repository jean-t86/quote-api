const express = require('express');
const app = express();

const {quotes} = require('./data');
const {getRandomElement, getIndexById, getNewId} =
 require('./utils');

const PORT = process.env.PORT || 4001;

app.use(express.static('public'));

app.get('/api/quotes/random', (req, res, next) => {
  const randomQuote = {
    quote: getRandomElement(quotes),
  };
  res.send(randomQuote);
});

app.get('/api/quotes', (req, res, next) => {
  const person = req.query.person;
  if (person) {
    const filteredQuotes = quotes.filter((val) => val.person === person);
    res.send({quotes: filteredQuotes});
  } else {
    res.send({quotes});
  }
});

app.post('/api/quotes', (req, res, next) => {
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

app.put('/api/quotes/:id', (req, res, next) => {
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

app.delete('/api/quotes/:id', (req, res, next) => {
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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
