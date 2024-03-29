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
import {ReactComponent as SendRPButton} from '../../Assets/sendRPbutton.svg'
import {casinoAbi} from '../../Abis/casinoAbi'
import {smartContractAddress} from '../../Config/config'
import {getrcom, sendrp, gethash} from '../../Utils/api'
import randomBinary from 'random-binary'
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'

const GameContainer=(Props)=> {

       const web3 = new Web3(Web3.givenProvider)
       const casinoContractAddress = smartContractAddress
       const casinoContract = new web3.eth.Contract(casinoAbi, casinoContractAddress)


       const [newDeck, setNewDeck]=useState()

       const [userCards, setUserCards]= useState([])
       const [userAddress, setUserAddress]= useState('')
       const [userAddressCheckSum, setUserAddressCheckSum]=useState('')
       const [userBetAmount, setUserBetAmount]=useState(0)

       const [dealerCards, setDealerCards]= useState([])

       const [rP1, setRP1]=useState('')
       const [rP2, setRP2]=useState('')

       const [rCom1, setRCom1]=useState('')
       const [rCom2, setRCom2]=useState('')

       const [userTurn, setUserTurn]=useState(false)

       const [userAlert, setUserAlert]=useState('')

       const [showBetInput, setShowBetInput]=useState(true)

       const [gameResult, setGameResult]= useState('')

       const [togglePayout, setTogglePayout]= useState(false)

       const [casinoTurn, setCasinoTurn]=useState(false)
       const [revealPhase, setRevealPhase]=useState(false)

       const [showModal, setShowModal]=useState(false)

       const [showRP, setShowRP]=useState(false)

       const [showFinalPayout, setShowFinalPayout]=useState(false)

       const [patienceAlert, setPatienceAlert]=useState('Please be patient with us while we audit your game data to detect cheating.')
       const [showPatienceAlert, setShowPatienceAlert]=useState(false)

       const [showConfetti, setShowConfetti]=useState(false)

       const [hideInfo, setHideInfo]=useState(false)

       const [shuffleAlert, setShuffleAlert]=useState('')

       const [clickReconstruct, setClickReconstruct]=useState(false)

       const { width, height } = useWindowSize()

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
                    setShuffleAlert('Casino is shuffling your deck using rFy. Please be patient.')
              })
              .catch((error)=>{
                     console.log(error.message)
                     if(error.Message === 'You have already sent us your rp.'){
                          alert('already sent RP')
                         // setShowRP((curr)=>!curr)
                     }
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
              setUserAlert('Hitting...')
              setCasinoTurn(true)

              try{
                     await casinoContract.methods.Player_Hit(userAddress).send({from: userAddress, to: casinoContractAddress})
                     getNewCard()
              }catch(error){
                    setCasinoTurn(false)
                     console.log(error)
              }
              let gameState = await getGameState()

              if(gameState === '3'){
                     setUserAlert('Choose again')
                     setCasinoTurn(false)
              }if (gameState === '4'){
                     setUserAlert('')
                     setUserTurn(!userTurn)
                     monitorPhase5Status()
              }else if(gameState === '5'){
                     monitorPhase5Status()
                     setUserAlert('')
                     setCasinoTurn(true)
                     setTogglePayout(true)
              }
       }

       const toggleShowBetInput=()=>{
              setShowBetInput(!showBetInput)
       }

       const getCardAtIndex= async (index)=>{
              try{
                     var value = await casinoContract.methods.getNewCard(index).call({from: userAddress})
                     console.log('this is the undefined value:', value)
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
               setCasinoTurn(true)
              setUserAlert('Standing...')
              console.log('Standing...')
              try{
                     await casinoContract.methods.Stand().send({from: userAddress, to: casinoContractAddress})
                     console.log("Sucessfully stood.")
                     setUserAlert('Stood. Awaiting casino action.')
              }catch(error){
                    setCasinoTurn(false)
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
                            setShowConfetti(()=>true)
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
              try{
                     await casinoContract.methods.initializeGame().send({from: userAddress, to: casinoContractAddress, value: web3.utils.toWei(bet.toString())})
                     await new Promise(resolve => setTimeout(resolve, 1000));
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
                          //index 0??
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
              var gamePhase = await getGameState()
              console.log('this is the gamePhase: !!!!!', gamePhase)

              if(gamePhase === '1'){
                         setShowRP(()=>true)
                         await timer(10000)
               }
              while(gamePhase !== '3'){
                    var gamePhase = await getGameState()
                    switch(gamePhase){
                         case '5':
                              setShuffleAlert('')
                              setHideInfo(()=> true)
                              setUserTurn(!userTurn)
                              setCasinoTurn(true)
                              monitorPhase5Status()
                              console.log('Game Over. Phase 5')
                              setRevealPhase(true)
                              getPlayerDeck()
                              setUserAlert('')
                              setTogglePayout(true)
                              break;
                    }
               }
               if(gamePhase === '3'){
                    setShuffleAlert('')
                    console.log(`It's your turn. Choose hit or stand.`)
                    setHideInfo(()=> true)
                    setUserTurn(!userTurn)
                    await initiatePhaseThree()
              }

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
          const timer = ms => new Promise(res => setTimeout(res, ms))
          try{
               console.log('trying payout')
               setUserAlert('Paying out.')
               const payout = await casinoContract.methods.Payout(userAddress).send({from: userAddress, to: casinoContractAddress})
               setUserAlert('Payout finished. Well clear your game data and refresh your game.')
               await timer(20000)
               window.location.reload()
          }catch(error){
               console.log(error)
          }
       }

       const reConstruct = async()=>{

              try{
                    setClickReconstruct(()=>true)
                    let data = await getRCOM(userAddressCheckSum)
                    setUserAlert('Reconstructing your deck for cheat detection.')
                    setShowPatienceAlert(()=>true)

                    try{
                         console.log('trying get shuffle 1')
                         setUserAlert('Calling Shuffle One, Sending rCom1 & rP1')
                         const shuffle1 = await casinoContract.methods.getShuffle1(userAddressCheckSum, data.rCom1, rP1).send({from: userAddress, to: casinoContractAddress})
                    }catch(error){
                         console.log(error)
                         setClickReconstruct(()=>false)
                         return
                    }

                    try{
                         console.log('trying get shuffle 2')
                         setUserAlert('Calling Shuffle Two, sending rCom2, rP2')
                         const shuffle2 =await casinoContract.methods.getShuffle2(userAddressCheckSum, data.rCom2, rP2).send({from: userAddress, to: casinoContractAddress})
                    }catch(error){
                         console.log(error)
                         setClickReconstruct(()=>false)
                         return
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
                         setClickReconstruct(()=>false)
                         return
                    }
                    
              }catch(error){
                    console.log(error)
                    setClickReconstruct(()=>false)
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
                     <div className={styles.background}>
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
                                                        {(userAlert != 'Bet submission cancelled. Please resubmit your bet.')?<Loader type="Oval" color="#00BFFF" height={35} width ={35} />:null}
                                                        <Prompt message={userAlert}/>
                                                 </div>:<Prompt message={userAlert}/>}
                                                 {(showPatienceAlert)?<Prompt message={patienceAlert}/>: null}
                                                 {(shuffleAlert != '')?<Prompt message={shuffleAlert}/>: null}
                                                 {(!showBetInput && !hideInfo)?<GameInfo />:null}
                                                 {(dealerCards === [])?null:<DealerHand deckData={dealerCards} revealPhase={revealPhase}/>}
                                                 {(userCards === [])?null:<UserHand deckData={userCards}/>}
                                                 {showRP?<SendRPButton id={styles.sendRPButton} onClick={()=>handleRP(userAddressCheckSum)}/>:null}
                                                 {(userTurn)?<Controls triggerHit={hit} triggerStand={stand} reConstruct={reConstruct} finalPayout={payout} showPayout={togglePayout} showFinalPayout={showFinalPayout} casinoTurn={casinoTurn} showModal={()=>setShowModal(!showModal)} showReconstruct={clickReconstruct}/>:null}
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
                            <div id={styles.confettiContainer}>
                              {(showConfetti)?<Confetti width={width} height={height} />:null}
                            </div>
                     </div>
              )
       }

}

export default GameContainer;
