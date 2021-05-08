import React from 'react'
import styles from '../Instructions/Instructions.module.scss'

const Instructions=()=> {
       return (
              <div className={styles.intructionsContainer}>
                 <div id={styles.welcome}>
                     <p id={styles.spade}>♠️</p>
                     <p id={styles.diamond}>♦</p>️
                     <p>Welcome to BlackJack!</p>
                     <p id={styles.club}>♣️</p>
                     <p id={styles.heart}>♥</p>
                 </div>    
                 <div className={styles.lines}>The objective of the game is to reach 21, or be closer to 21 than the dealer.</div>
                 <div className={styles.lines}>The dealer will begin by shuffling and distributing 2 cards.</div>
                 <div className={styles.lines}>If your cards total 21, you win.</div>
                 <div className={styles.lines}>If your cards total over 21, you lose. </div>
                 <div className={styles.lines}>If your cards total less than 21, you will have the option to hit (request another card) or stand (stick with your current cards).</div>
              </div>
       )
}

export default Instructions;
