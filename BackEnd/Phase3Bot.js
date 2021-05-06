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



const getPhase3Games = async () => {
   const temp = await casinoContract.methods.getPhase3Games().call({from: myAddress})
   activeGames = []
   for (i = 0; i < temp.length; i++){
       if (temp[i] != '0x0000000000000000000000000000000000000000'){
           activeGames.push(temp[i])
       }
   }
   return activeGames
}


const phase3Response =  async (activeGames, nonce) => {
    if (activeGames.length > 0){
        console.log("Games in phase 3 detected:")
        console.log(activeGames)
        console.log()
    }
    for (i = 0; i < activeGames.length; i++){
        activeGame = activeGames[i]
        console.log("Distribute cards for user and dealer for address:",activeGame)


    
        const gasPrice = await web3.eth.getGasPrice();
        const gasEstimate = await casinoContract.methods.distribute(activeGame).estimateGas({ from: myAddress, to: activeGame  });
        
        const response = await casinoContract.methods.distribute(activeGame).send({from: myAddress, to: activeGame, gasPrice: gasPrice, gas: gasEstimate })
        console.log("Done!")
        console.log(response)
        console.log()
    }
}


const main = async () => {



     let nonce = await web3.eth.getTransactionCount(myAddress, 'pending')
    const phase3Bot =  async () => {
        console.log("- - - - - - - - - -")
        console.log("Scanning phase 3 games...")
        console.log()
        var activeGames =  await getPhase3Games()
        console.log(activeGames)
        nonce += 33
        await phase3Response(activeGames, nonce)
        setTimeout(phase3Bot,5000)
    }
    phase3Bot()


    
}

main()