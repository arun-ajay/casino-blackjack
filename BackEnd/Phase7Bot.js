//IMPORTS
const config = require("./config")


//GLOBAL VARS
const Web3 = require("web3");
const provider = new Web3.providers.HttpProvider(config.web3Provider);
const sqlite3 = require("sqlite3").verbose()
const {open} = require('sqlite');
const initSqlJs = require('sql.js')
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
function createDBConnection(filename){
     return open({
          filename,
          driver: sqlite3.Database
     })
}

const getGameData =async(activeGame)=>{

     db = await createDBConnection("./blackjack.db")

     const query = "SELECT * FROM GAMEDATA WHERE [ADR] = ?"
     const row = await db.get(query,[activeGame])
     
     return row

}
  

const getPhase7Games = async () => {
   const temp = await casinoContract.methods.getPhase7Games().call({from: myAddress})
   activeGames = []
   for (i = 0; i < temp.length; i++){
       if (temp[i] != '0x0000000000000000000000000000000000000000'){
           activeGames.push(temp[i])
       }
   }
   return activeGames
}


const phase7Response =  async (activeGames, nonce) => {
    if (activeGames.length > 0){
        console.log("Detected the following games")
        console.log(activeGames)
        console.log()
    }
    for (i = 0; i < activeGames.length; i++){
        activeGame = activeGames[i]
        console.log("Clearing game for user:",activeGame)
        
        var gameData = await getGameData(activeGame)

        console.log("GAME DATA",gameData)
        console.log(typeof gameData)

        if (gameData == null){
             console.log("Preparing to shift user to phase 0")

          
             const gasPrice = await web3.eth.getGasPrice();
             const gasEstimate = await casinoContract.methods.Clear(activeGame).estimateGas({ from: myAddress, to: activeGame  });
             
             const response = await casinoContract.methods.Clear(activeGame).send({from: myAddress, to: activeGame, gasPrice: gasPrice, gas: gasEstimate })
             console.log("Done!")
             console.log(response)
             console.log()
        }
        else{
             console.log("NEED TO DELETE DATA...")
             const query = "DELETE FROM GAMEDATA WHERE [ADR] = ?"
             const result = await db.run(query,[activeGame])
             console.log("Deleted data for",activeGame)
           
        }
    }
}


const main = async () => {



     let nonce = await web3.eth.getTransactionCount(myAddress, 'pending')
    const phase7Bot =  async () => {
        var activeGames =  await getPhase7Games()
        console.log(activeGames)
        nonce += 33
        await phase7Response(activeGames, nonce)
        setTimeout(phase7Bot,5000)
    }
    phase7Bot()


    
}

main()