import React from 'react'
import styles from '../GameInfo/GameInfo.module.scss'
import {ReactComponent as Infographic} from '../../Assets/finalizedhashscheme.svg'
// import hashScheme from '../../Assets/finalizedhashscheme.png'

const GameInfo=(props)=> {
     
     return (
          <div className={styles.gameInfoContainer}>
               <div className={styles.lines} id={styles.header}>⚠️ Our goal is to create a fair environment by making cheating impossible. ⚠️</div>
               <div id={styles.line}>
               </div>
               <div className={styles.bottomSection}>
                    <div className={styles.lines}>To shuffle your deck, we use Fisher-Yates shuffle algorithm, with a slight twist.</div>
                    <div className={styles.lines}> The casino generates a RANDOM 312 bit binary string. We'll call these 312 bits 'rCom' (dealer-generated).
                    </div>
                    <div className={styles.lines}> Similarly, the player (you) will generate their own seperate RANDOM 312 bits. We'll call this 'rP' (player-generated).
                    </div>
                    <div className={styles.lines}>rCom and rP will be split in HALF to account for solidity function input limitations. This gives us rCom1, rCom2, rP1 and rP2 (each 156 bits).
                    </div>
                    <div className={styles.lines}>We then take the XOR operation of rCom1 and rP1, to generate rFy1 (rFy1 = rCom1 XOR rP1). Similarly, rFy2 = rCom2 XOR rP2).
                    </div>
                    <div className={styles.lines}>Then, we concatenate rFy1 and rFy2 to generate rFy. rFy is a 312 bit binary string that will be partitioned into groups of 6 bits.
                    </div>
                    <div className={styles.lines}>Each partition's integer value will tell fisher yate's shuffle algorithm which index to shuffle with.
                    </div>
               </div>
               <div className={styles.infographicContainer}>
                    <Infographic />
                    {/* <img src={hashScheme}/> */}
               </div>
          </div>
     )
}

export default GameInfo;
