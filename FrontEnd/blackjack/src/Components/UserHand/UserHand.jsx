import React, {Props, useEffect, useState} from 'react'
import Card from '../Card/Card'
import styles from '../UserHand/UserHand.module.scss'

const UserHand=(Props)=> {
       const [deck, setDeck]=useState([])
       const [total, setTotal]=useState(0)
       const [newTotal, setNewTotal]=useState(0)
       const [loss, setLoss]= useState('You lost')
       const [win, setWin]=useState('You Won')

       useEffect(()=>{
              setDeck(Props.deckData)
              console.log(Props.deckData)
              setTotal(Props.deckData.reduce(function(r,{value}) {
                     var val1 = r
                     var val2 = value
                     switch(r) {
                            case 'A':
                                   (total + 11 > 21)? val1 = 1: val1= 11
                                   break;
                            case 'K':
                                   val1 = 10
                                   break;
                            case 'Q':
                                   val1 = 10
                                   break;
                            case 'J':
                                   val1 = 10
                                   break;  
                            default:
                              break;
                          }
                     switch(value) {
                            case 'A':
                                   (total + 11 > 21)? val2 = 1: val2= 11
                                   break;
                            case 'K':
                                   val2 = 10
                                   break;
                            case 'Q':
                                   val2 = 10
                                   break;
                            case 'J':
                                   val2 = 10
                                   break;  
                            default:
                              break;
                          }
                     return val1 + val2 
              },0))
       }, [Props])

       return (
              <div className={styles.userHandContainer}>
                     {(deck.length != 0)?<div className={styles.title}>
                             Your hand: {total}
                     </div>:null}
                     <div className={styles.cards}>
                            {deck? deck.map((card, index)=> (<Card number={card.value} suit={card.suit} color={card.color}/>)): null}
                     </div>
              </div>
       )
}

export default UserHand;