const express = require('express');
const morgan = require('morgan');
const quotesRouter = require('./quotes-router.js');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.static('public'));

app.use(morgan('combined'));

app.use('/api/quotes', quotesRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
