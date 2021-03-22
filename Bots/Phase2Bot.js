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


const openCards = () => {
    var array = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51];
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }
  

const getPhase2Games = async () => {
   const temp = await casinoContract.methods.getPhase2Games().call({from: myAddress})
   activeGames = []
   for (i = 0; i < temp.length; i++){
       if (temp[i] != '0x0000000000000000000000000000000000000000'){
           activeGames.push(temp[i])
       }
   }
   return activeGames
}


const phase2Response =  async (activeGames) => {
    if (activeGames.length > 0){
        console.log("Detected the following games")
        console.log(activeGames)
        console.log()
    }
    for (i = 0; i < activeGames.length; i++){
        activeGame = activeGames[i]
        var freshDeck = openCards()

        console.log("Creating fresh deck for user:",activeGame)

        const params = {
            name: 'Casino_get_deck',
            type: 'function',
            inputs: [
                {
                    type: 'address',
                    name: activeGame
                },
                {
                    type: 'uint256[]',
                    name: freshDeck
                }
            ]
        }
    
        const gasPrice = await web3.eth.getGasPrice();
        const gasEstimate = await casinoContract.methods.Casino_get_deck(activeGame,freshDeck).estimateGas({ from: myAddress, to: activeGame  });
        
        const response = await casinoContract.methods.Casino_get_deck(activeGame,freshDeck).send({from: myAddress, to: activeGame, gasPrice: gasPrice, gas: gasEstimate })
        console.log("Done!")
        console.log(response)
        console.log()
    }
}


const main = async () => {



    const phase2Bot =  async () => {
        var activeGames =  await getPhase2Games()
        console.log(activeGames)
        await phase2Response(activeGames)
        setTimeout(phase2Bot,5000)
    }
    phase2Bot()

    // var activeGames = await getActiveGames()
   

    
}

main()