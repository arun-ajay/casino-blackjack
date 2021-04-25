import React from 'react'
import styles from '../Instructions/Instructions.module.scss'

const Instructions=()=> {
       return (
              <div className={styles.intructionsContainer}>
                 <p id={styles.welcome}>♠️♦️Welcome to BlackJack!♣️♥</p>    
                 <p>The objective of the game is to reach 21, or be closer to 21 than the dealer.</p>
                 <p>The dealer will begin by shuffling and distributing 2 cards.</p>
                 <p>If your cards total 21, you win.</p>
                 <p>If your cards total over 21, you lose. </p>
                 <p>If your cards total less than 21, you will have the option to hit (request another card) or stand (stick with your current cards).</p>
              </div>
       )
}

export default Instructions;
