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


// getActiveGames -> Retrieves all of the games that are in Phase 2


  

const getExpiredRevealGames = async () => {
   const temp = await casinoContract.methods.getExpiredReveal().call({from: myAddress})
   activeGames = []
   for (i = 0; i < temp.length; i++){
       if (temp[i] != '0x0000000000000000000000000000000000000000'){
           activeGames.push(temp[i])
       }
   }
   return activeGames
}


const phaseRevealResponse =  async (activeGames) => {
    if (activeGames.length > 0){
        console.log("Detected the following games")
        console.log(activeGames)
        console.log()
    }
    for (i = 0; i < activeGames.length; i++){
        activeGame = activeGames[i]
        console.log("Commiting casino actions...:",activeGame)

        const params = {
            name: 'Payout',
            type: 'function',
            inputs: [
                {
                    type: 'address',
                    name: activeGame
                }
            ]
        }
    
        const gasPrice = await web3.eth.getGasPrice();
        const gasEstimate = await casinoContract.methods.Payout(activeGame).estimateGas({ from: myAddress, to: activeGame  });
        
        const response = await casinoContract.methods.Payout(activeGame).send({from: myAddress, to: activeGame, gasPrice: gasPrice, gas: gasEstimate })
        console.log("Done!")
        console.log(response)
        console.log()
    }
}


const main = async () => {



    const phaseRevealBot =  async () => {
        var activeGames =  await getExpiredRevealGames()
        console.log(activeGames)
        await phaseRevealResponse(activeGames)
        setTimeout(phaseRevealBot,5000)
    }
    phaseRevealBot()


    
}

main()