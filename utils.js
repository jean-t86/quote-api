const getRandomElement = arr => {
  if (!Array.isArray(arr)) throw new Error('Expected an array');
  return arr[Math.floor(Math.random() * arr.length)];
}

const getElementById = (arr, id) => arr.find(val => val.id === id)

module.exports = {
  getRandomElement,
  getElementById
};
