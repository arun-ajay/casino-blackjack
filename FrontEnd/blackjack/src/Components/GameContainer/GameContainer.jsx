import React, {Props, useState} from 'react'
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
import {casinoAbi} from '../../Abis/casinoAbi'
import {smartContractAddress} from '../../Config/config'
import {getrcom, sendrp, gethash} from '../../Utils/api'

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
       const [userBetAmount, setUserBetAmount]=useState(0)

       const [dealerCards, setDealerCards]= useState([])
       const [dealerScore, setDealerScore]= useState(0)

       const [rP, setRP]=useState('')

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

       //GRANT METAMASK ACCESS
       const grantAccess=async (e)=>{
              e.preventDefault();

              if (typeof window.ethereum !== 'undefined') {
                     console.log('MetaMask is installed!');
                     let ethereum = window.ethereum
                     const accounts = await ethereum.request({method: 'eth_requestAccounts'})
                     const account = accounts[0]
                     setUserAddress(account)

              }else{
                     console.log('please install metamask')
              }

       }

       const randomDigit=()=> {
              return Math.floor(Math.random() * Math.floor(2));
       }
            
       const generateRandomBinary=(binaryLength)=> {
              let binary = "0b";
              for(let i = 0; i < binaryLength; ++i) {
                binary += randomDigit();
              }

              binary = binary.substring(binary.indexOf("b")+1);

              setRP(binary)
              return binary;
       }

       const getRCOM = (userAddress)=>{
              //address should be string
              let body = {"address":userAddress}

              getrcom(body)
              .then((response)=>{
                     console.log(response.data.rcom)
              })
              .catch((error)=>{
                     console.log(error)
              })    
       }
       
       const sendRP=(userAddress, rP)=>{
              let body = {"address":userAddress, "rp": rP }

              sendrp(body)
              .then((response)=>{
                     console.log(response)
              })
              .catch((error)=>{
                     console.log(error)
              })
       }

       const getHASH=(userAddress)=>{
              let body = {"address":userAddress}

              gethash(body)
              .then((response)=>{
                     console.log(response)
              })
              .catch((error)=>{
                     console.log(error)
              })
       }
            
       

       const hit= async ()=>{
              console.log('Hitting...')
              setUserAlert('Hitting...')
              try{
                     await casinoContract.methods.Player_Hit().send({from: userAddress, to: casinoContractAddress})
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
                            getGameResult()
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
              setUserAlert('')
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
              generateRandomBinary(312)
              console.log('BEGIN PHASE ONE...')
              try{
                     await casinoContract.methods.initializeGame().send({from: userAddress, to: casinoContractAddress, value: web3.utils.toWei(bet.toString())})
                     sendRP(userAddress, rP)
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



       const monitorPhase3Status=async ()=>{
              const timer = ms => new Promise(res => setTimeout(res, ms))
              var gamePhase = getGameState()
              while(gamePhase !== '3'){
                     var gamePhase = await getGameState()
                     console.log("GAME_PHASE:", gamePhase)
                     await timer(5000)
              }
              if(gamePhase === '3'){
                     console.log(`It's your turn. Choose hit or stand.`)
                     setUserTurn(!userTurn)
                     await initiatePhaseThree()
              }
              if(gamePhase === '5'){
                     monitorPhase5Status()
                     console.log('Game Over. Phase 5')
                     setRevealPhase(true)
                     setCasinoTurn(true)
                     getPlayerDeck()
                     setUserAlert('')
                     getGameResult()
                     setTogglePayout(true)
              }
       }

       const monitorPhase5Status=async()=>{
              const timer = ms => new Promise(res => setTimeout(res, ms))
              var gamePhase = getGameState()

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
                     setUserAlert('')
                     getGameResult()
                     setTogglePayout(true)
              }
       }

       const payout = async()=>{
              try{
                     setUserAlert('Paying out.')
                     await casinoContract.methods.Payout(userAddress).send({from: userAddress, to: casinoContractAddress})
                     console.log("Sucessfully payed out.")
                     setUserAlert('Payout finished. New game in 5 seconds...')
              }catch(error){
                     console.log(error)
              }
              const timer = ms => new Promise(res => setTimeout(res, ms))
              await timer(5000)
              window.location.reload()
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

                                                 {(userAlert && userAlert != 'Choose again')?<div id={styles.userAlert}>
                                                        <Loader type="Oval" color="#00BFFF" height={35} width ={35} />
                                                        <Prompt message={userAlert}/>
                                                 </div>:<Prompt message={userAlert}/>}

                                                 <DealerHand deckData={dealerCards} revealPhase={revealPhase}/>
                                                 <UserHand deckData={userCards}/>
                                                 {(userTurn)?<Controls triggerHit={hit} triggerStand={stand} payout={payout} showPayout={togglePayout} casinoTurn={casinoTurn} showModal={()=>setShowModal(!showModal)}/>:null}
                                          </div>
                                   </div> 
                            </div>
                            {(showModal)?<div className={styles.modalWrapper}>
                                   <Modal closeModal={()=>setShowModal(!showModal)}/> 
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
