let deck = Array.from({ length: 52 }, (_, i) => i + 1);
let test_arr = [];
let result = {};

function shuffling(deck) {
  var currentIndex = deck.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = deck[currentIndex];
    deck[currentIndex] = deck[randomIndex];
    deck[randomIndex] = temporaryValue;
  }

  return deck;
}

function generate_test() {
  for (let i = 0; i < 1000000; i++) {
    shuffling(deck);
    test_arr.push(deck[0]);
  }
}

generate_test();

function generate_result() {
  for (var i = 0; i < test_arr.length; i++) {
    if (!result[test_arr[i]]) result[test_arr[i]] = 0;
    ++result[test_arr[i]];
  }
}

generate_result();

function log_result() {
  for (var key in result) {
    var value = result[key];
    var percentage = Number(((value / 1000000) * 100).toFixed(2));
    console.log(key, percentage, "%  Total appearances:", value);
  }
}

log_result();
