const reverse = (string) => {
  return string.split("").reverse().join("");
};

const reverseWithReducer = (string) => {
  const reducer = (sofar, char) => {
    return char + sofar;
  };
  return string.split("").reduce(reducer, "");
};

const average = (array) => {
  const reducer = (sum, item) => {
    return sum + item;
  };

  return array.length === 0 ? 0 : array.reduce(reducer, 0) / array.length;
};

module.exports = {
  reverse,
  average,
  reverseWithReducer,
};
