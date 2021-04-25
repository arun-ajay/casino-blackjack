import React, {useState, useEffect} from 'react'
import Card from '../Card/Card'
import ReactToolTip from 'react-tooltip'
import DataTip from '../Modal/DataTip'
import '../Modal/Modal.css'

const Modal=(props)=> {
       const [userDeck, setUserDeck]=useState([])
       const [shuffledDeck, setShuffledDeck]=useState([])
       const [binaryArray, setBinaryArray]=useState([])
       const [cardIndex, setCardIndex]=useState(0)
       const [binary, setBinary]=useState(0)

       const [timesRan, setTimesRan]=useState(0)
       const [shouldAutoShuffle, setShouldAutoShuffle]=useState(false)
       const [showShuffledArray, setShowShuffledArray]=useState(false)

       const [finalDeck, setFinalDeck]=useState([])

       const questionMark = (showShuffledArray === false)? '???': null


       useEffect(()=>{
              setDeck()
              getBinary()
       },[])

       useEffect(()=>{
              if(shouldAutoShuffle){
                     setTimeout(()=>{
                            next()
                     }, 100)
              }

              if(cardIndex === 51){
                     setShouldAutoShuffle(false)
                     setShowShuffledArray(true)
                     let deck = getProperties(userDeck)
                     setFinalDeck(deck)
              }

       },[userDeck, shouldAutoShuffle])

       const setDeck =()=>{
              let deck = []

              for (var i=0; i<52; i++){
                     deck.push(i)
              }
              setCardIndex(0)
              setUserDeck(deck)

              let shuff = shuffle([...deck])
              setShuffledDeck(shuff)
       }

       const beginShuffle=()=>{
              setShouldAutoShuffle(true)
       }

       const next=()=>{
              console.log('trying')
              var newArr = [...userDeck]
              let decimalValue = (parseInt(binaryArray[cardIndex], 2))
              
              if (decimalValue < 51){
                     [newArr[cardIndex], newArr[decimalValue]]=[newArr[decimalValue], newArr[cardIndex]]
              }else{
                     [newArr[cardIndex], newArr[(decimalValue % 51)]]=[newArr[(decimalValue % 51)], newArr[cardIndex]]
              }

              setUserDeck(newArr)


              if (cardIndex <= userDeck.length-1){
                     setCardIndex((curr)=>curr + 1)
              } else{
                     setCardIndex(0)
              }
       }
       const shuffle=(array)=> {
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

       const getBinary=()=>{
              let chunks = chunkSubstr('1110011100111110101100000010010011001001000001000111100000001100100000000000100010110000010110110010010110011001011101110101000010110010101111000001000101101011100011010111011011000110000011011111101110000010001011000111101101101101000011111001100110010111000100010100001110000011111000100010011100000111011001', 6)
              setBinaryArray(chunks)
       }

       function chunkSubstr(str, size) {
              const numChunks = Math.ceil(str.length / size)
              const chunks = new Array(numChunks)
              const chunksDec = new Array()
              for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
                chunks[i] = str.substr(o, size)

              }
            
              return chunks
       }

       const BinaryToDec =(array)=>{
              let newArr = []
              for (var i=0;i<array.length;i++){

                     if(parseInt(array[i], 2) > 52){
                            newArr.push((parseInt(array[i], 2)) % 52)
                     }else{
                            newArr.push(parseInt(array[i], 2))
                     }
              }
              setBinary(newArr)
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

       const dataTip = `<div className="dataTipContainer">
              <div id="dataTipContents">We first start out by initializing an array of 52 integers. </div>
              <div id="dataTipContents">We then generate a 312 bit binary string and partition it into 6 bits. </div>
              <div id="dataTipContents">Each partition's value (i.e '101101' = 45) will give us the the original deck array's index that should be swapped.</div>
              <div id="dataTipContents">So in this case, initialArray[45] will be swapped with another element</div>
              <div id="dataTipContents">This happens until we shuffle all index of the original array. The end result is a fully randomized deck.</div>
       </div>`

  return (
    <div className="modalContainer">
           <div className="closeDiv" onClick={props.closeModal}>
                  <div id="closeButton">X</div>
                  <div id="how-it-works" data-tip={dataTip} data-html={true}>How it works?</div>
           </div>
           <div className="box">

              <div id="deckHeader">Initial Array:</div>
              <div className="deck1">
                     {(userDeck)?userDeck.map((card, index)=>
                     <div style={index === cardIndex ? { border: '1px solid red', margin: '5px', padding: '5px'}: {margin: '5px', padding: '5px'}} index={index}> [ {card} ]</div>
                     ):null}
              </div>

              <div id="binaryHeader">Generated Binary String (Partitioned into 6 bits):</div>
              <div className="deckbinary">
                     {(binaryArray)?binaryArray.map((binary, index)=>
                     <div style={index === cardIndex ? { border: '1px solid red', margin: '5px', padding: '5px'}: {margin: '5px', padding: '5px'}} index={index}>{binary}</div>
                     ):null} 
              </div>

              <div id="binaryHeader">Shuffled Array: {questionMark}</div>
              <div className="deck1">
                     {(showShuffledArray)?userDeck.map((card, index)=>
                     <div style={index === cardIndex ? { margin: '5px', padding: '5px'}: {margin: '5px', padding: '5px'}} index={index}>{card}</div>
                     ):null}
              </div>
              <div>
              =
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
                                   <div id="userHandModal">
                                          Put dealer's cards here
                                   </div>
                            </div>
                            <div id="verticalBar">

                            </div>
                            <div id="handHeaders">
                                   Your Hand:
                                   <div id="dealerHandModal">
                                          Put dealer's cards here
                                   </div>
                            </div>
                     </div>
                     <div id="ropstenLink">
                     https://ropsten.etherscan.io/address/0x89ac09d3edeb174217589485d518f1ea8be0d110
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