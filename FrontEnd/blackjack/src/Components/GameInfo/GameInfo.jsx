import React from 'react'
import styles from '../GameInfo/GameInfo.module.scss'
import {ReactComponent as Infographic} from '../../Assets/hashscheme.svg'
const GameInfo=(props)=> {
     
     return (
          <div className={styles.gameInfoContainer}>
               <div className={styles.lines} id={styles.header}>⚠️ Our goal is to create a fair environment by making cheating impossible. ⚠️</div>
               <div id={styles.line}>
               </div>
               <div className={styles.bottomSection}>
                    <div className={styles.lines}>To shuffle your deck, we use Fisher-Yates shuffle algorithm, with a slight twist.</div>
                    <div className={styles.lines}> The casino generates a RANDOM 512 bit binary string, in which we take 312 bits from. We'll call these 312 bits 'rD' (dealer-generated).
                    </div>
                    <div className={styles.lines}> Similarly, the player (you) will generate their own seperate RANDOM 312 bits. We'll call this 'rP' (player-generated).
                    </div>
                    <div className={styles.lines}>Using rP and rD, we can take the XOR operation of the two to generate a new 312 bit string. We'll call this 'rFy'.
                    </div>
                    <div className={styles.lines}>The casino then takes the 312 bit rFy string and splits it into groups of 6 bits. (we need 6 bits as that is enough bits to give us a value of at least 52; the deck will have 52 indexes)
                    </div>
                    <div className={styles.lines}>Now that the rFy string is split into 6 bit groups, we can take each group and generate the decimal value of the 6 bits. (i.e: '101011' = 43). This decimal value will let fisher yates shuffle algorithm know which index to shuffle with.
                    </div>
               </div>
               <div className={styles.infographicContainer}>
                    <Infographic />
               </div>
          </div>
     )
}

export default GameInfo;
