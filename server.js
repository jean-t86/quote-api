const express = require('express');
const app = express();

const { quotes } = require('./data');
const { getRandomElement, getElementById } = require('./utils');

const PORT = process.env.PORT || 4001;

app.use(express.static('public'));

app.get('/api/quotes/random', (req, res, next) => {
  const randomQuote = {
    quote: getRandomElement(quotes)
  };
  res.send(randomQuote);
});

app.get('/api/quotes', (req, res, next) => {
  const person = req.query.person;
  if (person) {
    const filteredQuotes = quotes.filter(val => val.person === person);
    res.send({ quotes: filteredQuotes });
  } else {
    res.send({ quotes });
  }
});

app.post('/api/quotes', (req, res, next) => {
  const quote = req.query.quote;
  const person = req.query.person;
  if (quote && person) {
    quotes.push({quote, person});
    res.send({quote: {quote, person}});
  } else {
    res.status(400).send();
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
