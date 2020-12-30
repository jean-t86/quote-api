const submitButton = document.getElementById('delete-quote');
const deletedQuoteContainer = document.getElementById('deleted-quote');

const renderError = (response) => {
  deletedQuoteContainer.innerHTML = `
  <p>Your request returned an error from the server: </p>
  <p>Code: ${response.status}</p>
  <p>${response.statusText}</p>`;
};

submitButton.addEventListener('click', () => {
  const id = document.getElementById('id').value;

  fetch(`/api/quotes/${id}`, {
    method: 'DELETE',
  })
      .then((response) => {
        if (response.ok) {
          const deletedQuote = document.createElement('div');
          deletedQuote.innerHTML = '<h3>Congrats, your quote was deleted!</h3>';
          deletedQuoteContainer.appendChild(deletedQuote);
        } else {
          renderError(response);
          throw Error();
        }
      })
      .catch((error) => console.error(error));
});
