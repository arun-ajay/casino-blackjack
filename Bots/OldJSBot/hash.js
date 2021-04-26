//IMPORTS
const config = require("./config");

const Web3 = require("web3");
const provider = new Web3.providers.HttpProvider(config.web3Provider);
const web3 = new Web3(provider);
web3.eth.net
  .isListening()
  .then(() => console.log("web3 is connected"))
  .catch((e) => console.log("Wow. Something went wrong"));

const casinoContract = new web3.eth.Contract(
  config.abi,
  config.smartContractAddress
);

web3.eth.accounts.wallet.add("0x" + config.casinoPrivateKey);

var accounts = web3.eth.accounts.wallet;
var account = accounts["0"];
var myAddress = account["address"];

let deck = [49, 23, 51, 17];

let deckHash = [];

// for (var i in deck) {
//   kek = web3.utils.soliditySha3(
//     web3.eth.abi.encodeParameters(["uint256", "uint256"], [123, deck[i]])
//   );
//   deckHash[i] = kek
// }

// console.log(deckHash)

// const test = async () =>{

//     const gasPrice = await  web3.eth.getGasPrice();
//     const gasEstimate = await  casinoContract.methods.casinoReceiveHash("0x5814c68Bec0B0B1e40EB678fe73987EE3b385e41",deckHash).estimateGas({ from: "0x5814c68Bec0B0B1e40EB678fe73987EE3b385e41", to: "0x5814c68Bec0B0B1e40EB678fe73987EE3b385e41"  });

//     const response = await  casinoContract.methods.casinoReceiveHash("0x5814c68Bec0B0B1e40EB678fe73987EE3b385e41",deckHash).send({from: "0x5814c68Bec0B0B1e40EB678fe73987EE3b385e41", to: "0x5814c68Bec0B0B1e40EB678fe73987EE3b385e41", gasPrice: gasPrice, gas: gasEstimate })
//     console.log("Done!")
//     console.log(response)
//     console.log()

// }

// test()
