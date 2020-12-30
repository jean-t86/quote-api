const submitButton = document.getElementById('submit-quote');
const updatedQuoteContainer = document.getElementById('updated-quote');

const renderError = (response) => {
  updatedQuoteContainer.innerHTML = `
  <p>Your request returned an error from the server: </p>
  <p>Code: ${response.status}</p>
  <p>${response.statusText}</p>`;
};

submitButton.addEventListener('click', () => {
  const id = document.getElementById('id').value;
  const quote = document.getElementById('quote').value;
  const person = document.getElementById('person').value;

  fetch(`/api/quotes/${id}?quote=${quote}&person=${person}`, {
    method: 'PUT',
  })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          renderError(response);
          throw Error();
        }
      })
      .then(({quote}) => {
        const updatedQuote = document.createElement('div');
        updatedQuote.innerHTML = `
        <h3>Congrats, your quote was updated!</h3>
        <div class="quote-id">${quote.id}</div>
        <div class="quote-text">${quote.quote}</div>
        <div class="attribution">- ${quote.person}</div>
        <p>Go to the <a href="index.html">home page</a> 
        to request and view all quotes.</p>
    `;
        updatedQuoteContainer.appendChild(updatedQuote);
      })
      .catch((error) => console.log(error));
});
