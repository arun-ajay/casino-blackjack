//IMPORTS
const config = require("./config")
const fs = require('fs')
const filebuffer = fs.readFileSync('blackjack.db')

const {randomBytes} = require("crypto")

//GLOBAL VARS
const Web3 = require("web3");
const randomBinary = require("random-binary")
const sqlite3 = require("sqlite3").verbose()
const {open} = require('sqlite');

const initSqlJs = require('sql.js')
const provider = new Web3.providers.HttpProvider(config.web3Provider);
const web3 = new Web3(provider);


web3.eth.net.isListening()
.then(() => console.log('web3 is connected'))
.catch(e => console.log('Wow. Something went wrong'));

const casinoContract = new web3.eth.Contract(config.abi,config.smartContractAddress)


web3.eth.accounts.wallet.add('0x' + config.casinoPrivateKey )


const accounts = web3.eth.accounts.wallet
const account = accounts["0"]
const myAddress = account["address"]

function createDBConnection(filename){
     return open({
          filename,
          driver: sqlite3.Database
     })
}





const generateRandomNumberWithHash=()=>{
       let rCom1 = randomBinary(156).toString()
       let rCom2 = randomBinary(156).toString()

       rCom1HashBytes32 = Web3.utils.soliditySha3({type: 'string', value: rCom1})
       rCom2HashBytes32 = Web3.utils.soliditySha3({type: 'string', value: rCom2})

       return{
            "rCom1": rCom1,
            "rCom1Hash": rCom1HashBytes32,
            "rCom2": rCom2,
            "rCom2Hash": rCom2HashBytes32
       }
}


//GOOD?
const shuffleCards=(shuffleArray)=>{
       let deck = []



       for(var i=0; i<52;i++){
              deck.push(i)
       }

       var currentIndex = 52
       var count= 0
       var temporaryValue = 0

       while(currentIndex != 0){
           currentIndex = currentIndex - 1
            var randomIndex = shuffleArray[count]
            temporaryValue = deck[currentIndex]
            deck[currentIndex] = deck[randomIndex]
            deck[randomIndex] = temporaryValue
            count += 1

       }
       return deck
}


//GOOD?
const getPhase2Games=async ()=>{
       const temp = await casinoContract.methods.getPhase2Games().call({from: myAddress})
       
       activeGames = []
       for (i = 0; i < temp.length; i++){

              if (temp[i] != '0x0000000000000000000000000000000000000000'){
                     activeGames.push(temp[i])
              }
       }

       return activeGames
}
// const test=()=>{

//      db.serialize(()=>{
//           db.all("SELECT * FROM GAMEDATA WHERE [ADR] = ?", '0x2372F830e274e0f4B5CD7710d519B60eA06007CB', (error, allRows)=>{
                 
//           }
//      }
// }

const getGameData =async(activeGame)=>{

     db = await createDBConnection("./blackjack.db")

     const query = "SELECT * FROM GAMEDATA WHERE [ADR] = ?"
     const row = await db.get(query,[activeGame])
     
     return row

}

const phase2Response=async (activeGame, nonce)=>{

       
       try{
              console.log("Processing game for: ", activeGame)
              
              var gameData = await getGameData(activeGame)

              console.log("GAME DATA",gameData)

              if (gameData == null){
                   casinoData = await generateRandomNumberWithHash()

                   const result = await db.run("INSERT OR REPLACE INTO GAMEDATA(ADR,RCOM1,RCOM2,RCOM1HASH,RCOM2HASH,RP1,RP2) VALUES (:ADR,:RCOM1,:RCOM2,:RCOM1HASH,:RCOM2HASH,:RP1,:RP2)",{
                        ":ADR": activeGame,
                        ":RCOM1": casinoData["rCom1"],
                        ":RCOM2": casinoData["rCom2"],
                        ":RCOM1HASH": casinoData["rCom1Hash"],
                        ":RCOM2HASH": casinoData["rCom2Hash"],
                        ":RP1": "",
                        ":RP2": ""
                   })
                   //Do db insert here

                   console.log("Created rcom1,rcom2,hash1,hash2 for casino. Waiting for player rp1 and rp2.")
              }
              else if ((gameData["RP1"].length == 0) || (gameData["RP2"] == 0)){
                        console.log("Cannot create deck yet. Still waiting on player rp1 and rp2");
               }
               else{
                        console.log("All data is present! Will now work on creating deck...")


                        var rCom1 = gameData["RCOM1"]
                        var rCom2 = gameData["RCOM2"]
                        var rP1 = gameData["RP1"]
                        var rP2 = gameData["RP2"]
                        var rCom1Hash = gameData["RCOM1HASH"]
                        var rCom2Hash = gameData["RCOM2HASH"]
                        var rFyBuild = []

                        var rD = rCom1 + rCom2
                        var rP = rP1 + rP2


                        for(var i=0; i<312; i++){
                               if (rD[i] === rP[i]){
                                      rFyBuild.push("0")
                               }else{
                                      rFyBuild.push("1")
                               }
                        }
                        rFy = rFyBuild.join('')
                        let binaryList = rFy.match(/.{6}/g)

                        let shuffleList = BinaryToDec(binaryList)

                        let shuffledDeck = shuffleCards(shuffleList)

                    await callTransaction(activeGame,shuffledDeck,gameData["RCOM1HASH"],gameData["RCOM2HASH"], nonce)
                        
                   
              }

       }catch(error){
              console.log(error)
       }
}

const BinaryToDec =(array)=>{
     let newArr = []
     for (var i=0;i<array.length;i++){

            if(parseInt(array[i], 2) >= 52){
                   newArr.push((parseInt(array[i], 2)) % 52)
            }else{
                   newArr.push(parseInt(array[i], 2))
            }
     }
     return newArr
}

const callTransaction= async (activeGame,shuffledDeck,rCom1Hash,rCom2Hash, nonce)=>{
     console.log(activeGame)
     console.log(shuffledDeck)
     console.log(typeof rCom1Hash)
     console.log(rCom2Hash)
     const gasPrice = await web3.eth.getGasPrice();

     const gasEstimate = await casinoContract.methods.Casino_get_deck(activeGame,shuffledDeck,rCom1Hash,rCom2Hash).estimateGas({ from: myAddress, to: activeGame  });

     const response = await casinoContract.methods.Casino_get_deck(activeGame,shuffledDeck,rCom1Hash,rCom2Hash).send({from: myAddress, to: activeGame,gasPrice: gasPrice, gas: gasEstimate })

     console.log("Done!")
     console.log(response)
     console.log()

}


const main = async () => {
   
     nonce = await web3.eth.getTransactionCount(myAddress, 'pending')

     const phase2Bot =  async () => {
          console.log("- - - - - - - - - -")
          console.log("Scanning games...")
          console.log()
   
          var phase2Games = await getPhase2Games()
          console.log(phase2Games)

          let randInt = Math.floor(Math.random() * 1000)
          if((phase2Games.length)>0){
                 console.log("Games in phase 2 detected:")
   
                 for(i=0;i<phase2Games.length;i++){
                    console.log(phase2Games[i])
                    nonce += randInt
                    await phase2Response(phase2Games[i], nonce)
                 }
   
          }
          setTimeout(phase2Bot, 5000);
     }
     phase2Bot()
     
 }
 
main()



      
   
   


