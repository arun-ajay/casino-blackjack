import React, {useState, useEffect} from 'react'
import Card from '../Card/Card'
import ReactToolTip from 'react-tooltip'
import DataTip from '../Modal/DataTip'
import closeButton from '../../Assets/close_button.svg'
import '../Modal/Modal.css'

const Modal=(props)=> {
       const [userDeck, setUserDeck]=useState([])
       const [shuffledDeck, setShuffledDeck]=useState([])
       const [binaryArray, setBinaryArray]=useState([])
       const [cardIndex, setCardIndex]=useState(51)
       const [binary, setBinary]=useState(0)
       const [count, setCount]=useState(0)
     //   const [tempValue, setTempValue]=useState(0)

       const [timesRan, setTimesRan]=useState(0)
       const [shouldAutoShuffle, setShouldAutoShuffle]=useState(false)
       const [showShuffledArray, setShowShuffledArray]=useState(false)
       const [startOfShuffle, setStartOfShuffle]=useState(false)
       const [doneShuffling, setDoneShuffling]=useState(false)
       const [dealerCards, setDealerCards]=useState([])
       const [userCards, setUserCards]=useState([])

       const [finalDeck, setFinalDeck]=useState([])

       const questionMark = (showShuffledArray === false)? '???': null
          const link = `https://ropsten.etherscan.io/address/${props.link}`

       useEffect(()=>{
               setDeck()
               getBinary()
               setDealerCards(props.dealerHand)
               setUserCards(props.userHand)
       },[])
       useEffect(()=>{
          
          },[cardIndex])

       useEffect(()=>{
              if(shouldAutoShuffle){
                   var result = null;
                     setTimeout(async ()=>{
                         result = await next()
                         if (cardIndex === 0){
                              console.log('card index -0')
                              console.log('this is the result: ', result)
                              let deck = getProperties(result)
                              console.log('this is the REAL final deck', deck)

                              setFinalDeck(deck)
                         }
                     }, 100)
              }

              if(cardIndex === 0){
                     setShouldAutoShuffle(false)
                     setShowShuffledArray(true)
                     console.log('right before enters getProperties', userDeck)
                     let deck = getProperties(userDeck)
                     console.log('this is the final deck', deck)
                     console.log('this is the result!', result)
                    //  setFinalDeck(result)
              }

       },[userDeck, shouldAutoShuffle])

       const setDeck =()=>{
              let deck = []

              for (var i=0; i<52; i++){
                     deck.push(i)
              }
              setUserDeck(deck)
       }

       const beginShuffle=()=>{
               setStartOfShuffle(true)
              setShouldAutoShuffle(true)
       }


       const next=async ()=>{
              var newArr = [...userDeck]

              if(cardIndex > -1){
                    setCardIndex((curr)=>curr -1)
                    var randomIndex = shuffledDeck[count]
                    var tempValue = newArr[cardIndex]
                    newArr[cardIndex] = newArr[randomIndex]
                    newArr[randomIndex] = tempValue 
                    setCount((curr)=>curr + 1)
              }

              console.log(cardIndex)
              console.log('this is step one', newArr)

              setUserDeck(newArr)

              return newArr
       }

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


       const getBinary=()=>{

               var rFyBuild = []

               let rCom1 = props.rCom1
               let rCom2 = props.rCom2
               let rP1 = props.rP1
               let rP2 = props.rP2
               var rD = rCom1 + rCom2
               var rP = rP1 + rP2

               for(var i=0; i<312; i++){
                    if (rD[i] === rP[i]){
                          rFyBuild.push("0")
                    }else{
                          rFyBuild.push("1")
                    }
               }

               let rFy = rFyBuild.join('')
               let binaryList = rFy.match(/.{6}/g)
               setBinaryArray(binaryList)
               let shuffleList = BinaryToDec(binaryList)
              let tempShuffledDeck = shuffleCards(shuffleList)
          //     setShuffledDeck(tempShuffledDeck)
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
              setShuffledDeck(newArr)
              console.log('shuffled deck: ', newArr)
              return newArr
       }


       const getProperties=(hand)=>{
              var i;
              var arr = []
              for(i=0;i<hand.length;i++){
                     var suits = '♠︎ ♥︎ ♣︎ ♦︎'.split(' ')
                     var index = parseInt(hand[i])
                     console.log('---inside getProperties---')
                     console.log(index)
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

       const dataTip = `<div className="dataTipContainer">
              <div id="dataTipContents">We first start out by initializing an array of 52 integers. </div>
              <div id="dataTipContents">We then generate a 312 bit binary string and partition it into 6 bits. </div>
              <div id="dataTipContents">Each partition's value (i.e '101101' = 45) will give us the the original deck array's index that should be swapped.</div>
              <div id="dataTipContents">So in this case, initialArray[45] will be swapped with another element</div>
              <div id="dataTipContents">This happens until we shuffle all index of the original array. The end result is a fully randomized deck.</div>
       </div>`

  return (
    <div className="modalContainer">
           <div className="closeDiv">
                  <img id="closeButton" src={closeButton} onClick={props.closeModal}/>
                  <div id="how-it-works" data-tip={dataTip} data-html={true}>How it works?</div>
           </div>
           <div className="box">

              {(startOfShuffle)?<div id="deckHeader">Shuffling Array...</div>:<div id="deckHeader">Initial Array:</div>}
              {/* {(showShuffledArray)?<div id="deckHeader">Shuffled Array!</div>:null} */}
              <div className="deck1">
                     {(userDeck)?userDeck.map((card, index)=>
                     <div style={index === cardIndex ? { border: '1px solid red', 'box-shadow': '0 0 4px #FF003A', 'background-color': 'white', margin: '5px', padding: '5px'}: {margin: '5px', padding: '5px'}} index={index}> [ {card} ]</div>
                     ):null}
              </div>

              <div id="binaryHeader">Generated Binary String (Partitioned into 6 bits):</div>
              <div className="deckbinary">
                     {(binaryArray)?binaryArray.map((binary, index)=>
                     <div style={index === cardIndex ? { border: '1px solid red', 'box-shadow': '0 0 4px #FF003A','background-color': 'white', margin: '5px', padding: '5px'}: {margin: '5px', padding: '5px'}} index={index}>{binary}</div>
                     ):null} 
              </div>
              {(showShuffledArray)?<div className="bottomWrapper">
                     <div id="binaryHeader">
                     Full Deck
                     </div>
                     {(showShuffledArray)?
                     <div className="finalCards">
                            {(finalDeck)? finalDeck.map((card, index)=><Card number={card.value} suit={card.suit} color={card.color} type='small'/>): null}
                     </div>:null}
                     <div className="hands-section">
                            <div id="handHeaders">
                                   Dealer's Hand:
                                   <div id="dealerHandModal">
                                   {finalDeck? dealerCards.map((card, index)=> (<Card number={card.value} suit={card.suit} color={card.color} type='small'/>)): null}
                                   </div>
                            </div>
                            <div id="verticalBar">

                            </div>
                            <div id="handHeaders">
                                   Your Hand:
                                   <div id="userHandModal">
                                        {finalDeck? userCards.map((card, index)=> (<Card number={card.value} suit={card.suit} color={card.color} type='small'/>)): null}
                                   </div>
                            </div>
                     </div>
                     <div id="ropstenLink">
                          <p>Your smart contract's etherscan: </p>
                         <a href={link} target="_blank">https://ropsten.etherscan.io/address/{props.link}</a>
                     </div>
              </div>:null}
              <div className="buttons">
                     <button onClick={beginShuffle}>Begin shuffle</button>
              </div>
              <ReactToolTip/>
                  
           </div>
    </div>
  );
}
export default Modal