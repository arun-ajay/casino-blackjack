//IMPORTS
const config = require("./config")

const Web3 = require("web3");
const provider = new Web3.providers.HttpProvider(config.web3Provider);
const web3 = new Web3(provider);


encode = web3.eth.abi.encodeParameters(['uint256','uint8[]'], [123, [0,1,2,3]])


console.log(encode)
console.log(typeof(encode))
kek = web3.utils.keccak256(encode,{encoding:'hex'}) // ALIAS


console.log()

console.log(kek)
console.log(typeof(kek))