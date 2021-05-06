//IMPORTS
const config = require("./config")


//GLOBAL VARS
const Web3 = require("web3");
const provider = new Web3.providers.HttpProvider(config.web3Provider);
const web3 = new Web3(provider);
web3.eth.net.isListening()
.then(() => console.log('web3 is connected'))
.catch(e => console.log('Wow. Something went wrong'));


const casinoContract = new web3.eth.Contract(config.abi,config.smartContractAddress)


web3.eth.accounts.wallet.add('0x' + config.casinoPrivateKey )


var accounts = web3.eth.accounts.wallet
var account = accounts["0"]
var myAddress = account["address"]



const depositEther =  async () => {

    depositAmount = '1'
    console.log("Depositing 1 Ethereum. Please wait..")
    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await casinoContract.methods.depositMoney().estimateGas({ from: myAddress, to: config.smartContractAddress, value: web3.utils.toWei(depositAmount,'ether')});
    
    const response = await casinoContract.methods.depositMoney().send({from: myAddress, to: config.smartContractAddress, value: web3.utils.toWei(depositAmount,'ether'), gasPrice: gasPrice, gas: gasEstimate });
    console.log("Done!")
    console.log(response)
    console.log()
}


const main = async () => {

    await depositEther();
    
}

main()