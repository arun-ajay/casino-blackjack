import React, {Props, useState, useEffect} from 'react'
import Controls from '../Controls/Controls'
import Card from '../Card/Card'
import Prompt from '../Prompt/Prompt'
import DealerHand from '../DealerHand/DealerHand'
import UserInputPanel from '../UserInputPanel/UserInputPanel'
import UserHand from '../UserHand/UserHand'
import styles from '../GameContainer/GameContainer.module.scss'
import Web3 from 'web3'
import background from '../../Assets/blackjack_table.jpeg'
import Instructions from '../Instructions/Instructions'
import Loader from 'react-loader-spinner'
import Modal from '../Modal/Modal'
import GameInfo from '../GameInfo/GameInfo'
import {casinoAbi} from '../../Abis/casinoAbi'
import {smartContractAddress} from '../../Config/config'
import {getrcom, sendrp, gethash} from '../../Utils/api'
import randomBinary from 'random-binary'

const GameContainer=(Props)=> {

       const web3 = new Web3(Web3.givenProvider)
       const casinoContractAddress = smartContractAddress
       const casinoContract = new web3.eth.Contract(casinoAbi, casinoContractAddress)

       const [message, setMessage]= useState('Default Alert')
       const [deck, setDeck]=useState()

       const [newDeck, setNewDeck]=useState()

       const [testDeck, setTestDeck]=useState()
       const [testState, setTestState]=useState([])
       const [userCards, setUserCards]= useState([])
       const [userScore, setUserScore]= useState(0)
       const [userAddress, setUserAddress]= useState('')
       const [userAddressCheckSum, setUserAddressCheckSum]=useState('')
       const [userBetAmount, setUserBetAmount]=useState(0)

       const [dealerCards, setDealerCards]= useState([])
       const [dealerScore, setDealerScore]= useState(0)

       const [rP1, setRP1]=useState('')
       const [rP2, setRP2]=useState('')

       const [rCom1, setRCom1]=useState('')
       const [rCom2, setRCom2]=useState('')

       const [balance, setBalance]= useState(100)
       const [bet, setBet]= useState(0)

       const [userTurn, setUserTurn]=useState(false)

       const [userChoice, setUserChoice]=useState('')
       const [userAlert, setUserAlert]=useState('')

       const [showBetInput, setShowBetInput]=useState(true)

       const [gameResult, setGameResult]= useState('')

       const [togglePayout, setTogglePayout]= useState(false)

       const [areButtonsDisabled, setAreButtonsDisabled]= useState(false)

       const [casinoTurn, setCasinoTurn]=useState(false)
       const [revealPhase, setRevealPhase]=useState(false)

       const [showModal, setShowModal]=useState(false)

       const [showRP, setShowRP]=useState(false)

       const [showFinalPayout, setShowFinalPayout]=useState(false)

       const [patienceAlert, setPatienceAlert]=useState('Please be patient with us while we audit your game data to detect cheating.')
       const [showPatienceAlert, setShowPatienceAlert]=useState(false)

       //GRANT METAMASK ACCESS
       const grantAccess=async (e)=>{
              e.preventDefault();

              if (typeof window.ethereum !== 'undefined') {
                     console.log('MetaMask is installed!');
                     let ethereum = window.ethereum
                     const accounts = await ethereum.request({method: 'eth_requestAccounts'})
                     const account = accounts[0]
                     setUserAddress(account)
                     setUserAddressCheckSum(web3.utils.toChecksumAddress(account))

              }else{
                     console.log('please install metamask')
              }

       }

     //   useEffect(()=>{
     //      console.log(rCom1, rCom2)
     //   }, [rCom1, rCom2])
            
     //   const generateRandomBinary=()=>{
     //          let randomOne = randomBinary(156)
     //          let randomTwo = randomBinary(156)

     //          setRP1(randomOne)
     //          setRP2(randomTwo)
     //   }

       const getRCOM = async (userAddress)=>{
              //address should be string
               let body = {"address": userAddress}
               let data = null
               await getrcom(body)
               .then((response)=>{
                     setRCom1(()=>response.data.rCom1)
                     setRCom2(()=>response.data.rCom2)
                     data = response.data
                     
               })
               .catch((error)=>{
                     console.log(error)
               })    

              return data
       }
       
       const sendRP=async (userAddress, rPOne, rPTwo)=>{
              let body = {"address":userAddress, "rP1": rPOne, "rP2": rPTwo }

              sendrp(body)
              .then((response)=>{
                     console.log(response)
              })
              .then(()=>{
                    setShowRP((curr)=>!curr)
              })
              .catch((error)=>{
                     console.log(error.message)
              })
       }

       const getHASH=(userAddress)=>{
              let body = {"address":userAddress}

              gethash(body)
              .then((response)=>{
                     console.log(response)
              })
              .catch((error)=>{
                     console.log(error.message)
              })
       }
            
       

       const hit= async ()=>{
              console.log('Hitting...')
              setUserAlert('Hitting...')

              try{
                     await casinoContract.methods.Player_Hit(userAddress).send({from: userAddress, to: casinoContractAddress})
                     console.log("Sucessfully hit.")
                     getNewCard()
              }catch(error){
                     console.log(error)
              }
              let gameState = await getGameState()

              if(gameState === '3'){
                     //choose again
                     console.log('choose again.')
                     setUserAlert('Choose again')
              }if (gameState === '4'){
                     console.log('not your turn anymore.')
                     setUserAlert('')
                     setUserTurn(!userTurn)
                     monitorPhase5Status()
              }else if(gameState === '5'){
                     console.log('reveal phase')
                     monitorPhase5Status()
                     setUserAlert('')
                    //  getGameResult()
                     setCasinoTurn(true)
                     setTogglePayout(true)
              }
       }

       const toggleShowBetInput=()=>{
              setShowBetInput(!showBetInput)
       }

       const getCardAtIndex= async (index)=>{
              try{
                     var value = await casinoContract.methods.mapPlayer_card(userAddress, index).call({from: userAddress})
                     console.log("Retrieved value.")
              }catch(error){
                     console.log(error)
              }

              return value
       }

       const getPlayerAceCount= async ()=>{
              try{
                     var playerAceCount = await casinoContract.methods.player_AceCount(userAddress).call({from: userAddress})
                     console.log("Retrieved player ace count.")
              }catch(error){
                     console.log(error)
              }

              //returns playerAceCount (string)
              return playerAceCount
       }


       const getNewCard= async ()=>{
              let index = userCards.length
              let value = await getCardAtIndex(index)

              let newArr = []
              newArr.push(value)

              let addedCard = getProperties(newArr)
              setUserCards([...userCards, addedCard[0]])
       }


       const stand=async ()=>{
              setUserAlert('Standing...')
              console.log('Standing...')
              try{
                     await casinoContract.methods.Stand().send({from: userAddress, to: casinoContractAddress})
                     console.log("Sucessfully stood.")
                     setUserAlert('Stood. Awaiting casino action.')
                     setCasinoTurn(true)
              }catch(error){
                     console.log(error)
              }
              monitorPhase5Status()
       }

       const handleUserBet=async (bet)=>{
              setUserBetAmount(bet)
              await initiatePhaseOne(bet)
              await monitorPhase3Status()
       }
       const getPlayerDeck=async ()=>{
             let playerDeck = await casinoContract.methods.getPlayerHand(userAddress).call({from: userAddress})
             console.log(playerDeck) 
             getCardValues(playerDeck, 'user')
             setNewDeck(playerDeck)
             return playerDeck
       }
       const getCasinoHand= async()=>{
              let casinoHand = await casinoContract.methods.getCasinoHand().call({from: userAddress})
              return casinoHand
       }

       const getGameState=async ()=>{
              let gameState = await casinoContract.methods.mapGamestate(userAddress).call({from: userAddress})
              return gameState
       }
       const getGameResult= async ()=>{
              let gameResult = await casinoContract.methods.mapGameResult(userAddress).call({from: userAddress})
              console.log(gameResult)
              //set state
              switch(gameResult) {
                     case '0':
                            setGameResult('Game not started.')
                            break;
                     case '1':
                            setGameResult('Game in progress.')
                            break;
                     case '2':
                            setGameResult(`You've won!`)
                            break;
                     case '3':
                            setGameResult(`You've lost, sorry.`)
                            break;
                     case '4':
                            setGameResult(`It's a tie.`)
                            break;   
                     default:
                       break;
              }
              return gameResult
       }

       //PHASE ONE - initialize game
       const initiatePhaseOne= async (bet)=>{
              setUserAlert('Submitting your bet...')
              console.log('BEGIN PHASE ONE...')
              try{
                     await casinoContract.methods.initializeGame().send({from: userAddress, to: casinoContractAddress, value: web3.utils.toWei(bet.toString())})
                    //  sendRP(userAddress, rP1, rP2)
                     await new Promise(resolve => setTimeout(resolve, 1000));
                    console.log('trying to send RP')
                     console.log('initialized game - PHASE ONE, CLEAR.')
                     toggleShowBetInput()
                     setUserAlert('Casino is shuffling cards and distributing them...')
              } catch (error){
                     if (error.code === 4001){
                            setUserAlert('Bet submission cancelled. Please resubmit your bet.')
                     }
                     console.log(error.message)
              }
       }

       const getCardValues=(hand, player)=>{
              var i;
              var arr = []
              for(i=0;i<hand.length;i++){
                     var suits = '♠︎ ♥︎ ♣︎ ♦︎'.split(' ')

                     var index = parseInt(hand[i])
                     if(index <= 51){
                            var value = (index % 13) + 1
                            var color = (index % 2== 0)? 'red': 'black'
                            var suit = value /13 | 0

                            //ACE
                            if (value === 1){
                                   var value = 'A'
                            //JACK
                            }else if(value === 11){
                                   var value = 'J'
                            //QUEEN
                            }else if (value === 12){
                                   var value = 'Q'
                            //KINK
                            }else if (value === 13){
                                   var value = 'K'
                            }
                            arr.push({value: value, color: color, suit: suits[suit]})
                     }
              }
              if(player === 'user'){
                     setUserCards([arr.pop(), arr.pop()])
              }else if(player === 'casino'){
                     setDealerCards([arr.pop()])
              }
              return arr
       }


       const getProperties=(hand)=>{
              var i;
              var arr = []
              for(i=0;i<hand.length;i++){
                     var suits = '♠︎ ♥︎ ♣︎ ♦︎'.split(' ')
                     var index = parseInt(hand[i])
                     if(index <= 51){
                            var value = (index % 13) + 1
                            var color = (index % 2== 0)? 'red': 'black'
                            var suit = value /13 | 0

                            //ACE
                            if (value === 1){
                                   var value = 'A'
                            //JACK
                            }else if(value === 11){
                                   var value = 'J'
                            //QUEEN
                            }else if (value === 12){
                                   var value = 'Q'
                            //KING
                            }else if (value === 13){
                                   var value = 'K'
                            }
                            arr.push({value: value, color: color, suit: suits[suit]})
                     }
              }

              return arr
       }

       const getCasinoFirstCard=async ()=>{
              let firstCard = await casinoContract.methods.showCasinoFirstCard().call({from: userAddress})
              var tempDeck = [firstCard]

              getCardValues(tempDeck, 'casino')
       }

       const handleRP=async (adr)=>{
          let randomOne = randomBinary(156)
          let randomTwo = randomBinary(156)

          setRP1(randomOne)
          setRP2(randomTwo)

          setUserAlert('Sending randomly generated binary bits (rP1 & rP2) to assist in your deck shuffle...')
          let response = await sendRP(adr, randomOne, randomTwo)
       }



       const monitorPhase3Status=async ()=>{
              const timer = ms => new Promise(res => setTimeout(res, ms))
              await timer(5000)
              var gamePhase = await getGameState()
              console.log('this is the gamePhase: ', gamePhase)
              if(gamePhase === '1'){
                    setShowRP(()=>true)
                    await timer(2000)
               }
              while(gamePhase !== '3'){
                   console.log('starting while loop: ')
                   console.log(gamePhase)
                     var gamePhase = await getGameState()
                     if(gamePhase === '5'){
                         monitorPhase5Status()
                         console.log('Game Over. Phase 5')
                         setRevealPhase(true)
                         setCasinoTurn(true)
                         getPlayerDeck()
                         setUserAlert('')
                         setTogglePayout(true)
                    }
                     await timer(2000)
              }
              
              if(gamePhase === '3'){
                     console.log(`It's your turn. Choose hit or stand.`)
                     setUserTurn(!userTurn)
                     await initiatePhaseThree()
              }
          //     if(gamePhase === '5'){
          //            monitorPhase5Status()
          //            console.log('Game Over. Phase 5')
          //            setRevealPhase(true)
          //            setCasinoTurn(true)
          //            getPlayerDeck()
          //            setUserAlert('')
          //            setTogglePayout(true)
          //     }
       }

       const monitorPhase5Status=async()=>{
              const timer = ms => new Promise(res => setTimeout(res, ms))
              var gamePhase = await getGameState() //just changed this.
              //CHECK THIS!!!
               console.log(gamePhase)
              while(gamePhase != '5'){
                     var gamePhase = await getGameState()
                     console.log("GAME_PHASE:", gamePhase)
                     await timer(5000)
              }
              if(gamePhase === '5'){
                     let casinoHand = await getCasinoHand()
                     let deck = getProperties(casinoHand)
                     setRevealPhase(true)
                     setDealerCards(deck)
                     setUserAlert('Game Over. Please initiate deck reconstruction for cheat detection.')

                    //  getGameResult()
                     setTogglePayout(true)
              }
       }

       const payout = async()=>{
          try{
               console.log('trying payout')
               setUserAlert('Paying out.')
               const payout = await casinoContract.methods.Payout(userAddress).send({from: userAddress, to: casinoContractAddress})
               setUserAlert('Payout finished. Please wait while we clear your data.')
          }catch(error){
               console.log(error)
          }
       }

       const reConstruct = async()=>{

              try{
                    let data = await getRCOM(userAddressCheckSum)
                    setUserAlert('Reconstructing your deck for cheat detection.')
                    setShowPatienceAlert(()=>true)

                    try{
                         console.log('trying get shuffle 1')
                         setUserAlert('Calling Shuffle One, Sending rCom1 & rP1')
                         const shuffle1 = await casinoContract.methods.getShuffle1(userAddressCheckSum, data.rCom1, rP1).send({from: userAddress, to: casinoContractAddress})
                    }catch(error){
                         console.log(error)
                    }

                    try{
                         console.log('trying get shuffle 2')
                         setUserAlert('Calling Shuffle Two, sending rCom2, rP2')
                         const shuffle2 =await casinoContract.methods.getShuffle2(userAddressCheckSum, data.rCom2, rP2).send({from: userAddress, to: casinoContractAddress})
                    }catch(error){
                         console.log(error)
                    }

                    try{
                         console.log('trying SC fisher yates')
                         setUserAlert('Re-Shuffling using fisher-yates shuffle algorithm with rCom1, rCom2, rP1, and rP2 .')
                         const fisherYates = await casinoContract.methods.FisherYatesShuffle(userAddressCheckSum).send({from: userAddress, to: casinoContractAddress})
                         await getGameResult()
                         setShowPatienceAlert(()=>false)
                         setUserAlert('Everything seems to be ok. Call payout for a payout.')
                         setShowFinalPayout(()=>true)
                    }catch(error){
                         console.log(error)
                    }
                    
              }catch(error){
                    console.log(error)
              }
       }

       //PHASE FOUR - Player's turn. Hit or stand
       const initiatePhaseThree = async ()=>{
              setUserAlert('')
              getPlayerDeck()
              getCasinoFirstCard()
       }

       if (userAddress === ''){
              return (<div>
                            <div className={styles.gameContainer}>
                                   <div className={styles.header}>
                                          BlackJack - Team RED
                                   </div>  
                                   <div className={styles.initBody}>
                                          <Instructions/>
                                          <button className={styles.grantMetaMaskButton} onClick={grantAccess}>I'm Ready</button>
                                   </div> 
                            </div>
                            <div className={styles.credits}>
                                   <div className={styles.names}>Arun Ajay</div>
                                   <div className={styles.names}>Ali Belaj</div>
                                   <div className={styles.names}>Hong Chen</div>
                                   <div className={styles.names}>Chengliang Tan</div>
                                   <div className={styles.names}>Lihan Zhan</div>
                                   <div className={styles.names}>Hong Fei Zheng</div>
                            </div>
                     </div>
              )
       }else{
              return (
                     <div>
                            <div className={styles.gameContainer}>
                                   <div className={styles.header}>
                                          BlackJack - Team RED
                                   </div>  
                                   <div className={styles.body}>
                                          {(showBetInput)?<div className={styles.controlPanel}>
                                                 <UserInputPanel betAmount={handleUserBet} userAddress={userAddress}/>
                                          </div>:null}
                                          <div className={styles.game}>
                                                 {(showBetInput)?<div className={styles.message}>Please submit your bet to start the game.</div>:null}
                                                 {(gameResult != '')?<Prompt message={gameResult}/>: null}
                                                 {/* <GameInfo /> */}
                                                 {(userAlert && userAlert != 'Choose again')?<div id={styles.userAlert}>
                                                        {(userAlert != 'Bet submission cancelled. Please resubmit your bet.')?<Loader type="Oval" color="#00BFFF" height={35} width ={35} />:null}
                                                        <Prompt message={userAlert}/>
                                                 </div>:<Prompt message={userAlert}/>}
                                                 {(showPatienceAlert)?<Prompt message={patienceAlert}/>: null}

                                                 <DealerHand deckData={dealerCards} revealPhase={revealPhase}/>
                                                 <UserHand deckData={userCards}/>
                                                 {showRP?<button onClick={()=>handleRP(userAddressCheckSum)}>send RP</button>:null}
                                                 {(userTurn)?<Controls triggerHit={hit} triggerStand={stand} reConstruct={reConstruct} finalPayout={payout} showPayout={togglePayout} showFinalPayout={showFinalPayout} casinoTurn={casinoTurn} showModal={()=>setShowModal(!showModal)}/>:null}
                                          </div>
                                   </div> 
                            </div>
                            {(showModal)?<div className={styles.modalWrapper}>
                                   <Modal closeModal={()=>setShowModal(!showModal)} rCom1={rCom1} rCom2={rCom2} rP1={rP1} rP2={rP2} userHand={userCards} dealerHand={dealerCards} link={smartContractAddress}/> 
                            </div>: null}
                            <div className={styles.credits}>
                                          <div className={styles.names}>Arun Ajay</div>
                                          <div className={styles.names}>Ali Belaj</div>
                                          <div className={styles.names}>Hong Chen</div>
                                          <div className={styles.names}>Chengliang Tan</div>
                                          <div className={styles.names}>Lihan Zhan</div>
                                          <div className={styles.names}>Hong Fei Zheng</div>
                            </div>
                     </div>
              )
       }

}

export default GameContainer;
