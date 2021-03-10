var crypto = require("crypto");

function randomValueHex(len) {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex") // convert to hexadecimal format
    .slice(0, len); // return required number of characters
}

var value1 = randomValueHex(32);
var value2 = randomValueHex(32);
var value3 = randomValueHex(32);

console.log(value1, "\n", value2, "\n", value3);

//   crypto.randomBytes() method lets you get cryptographically strong random values.
//   The array given as the parameter is filled with random numbers (random in its cryptographic meaning).

//   To guarantee enough performance, implementations are not using a truly random number generator,
//   but they are using a pseudo-random number generator seeded with a value with enough entropy.
//   The pseudo-random number generator algorithm (PRNG) may vary across user agents,
//   but is suitable for cryptographic purposes.
