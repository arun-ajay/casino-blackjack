import React, {Props, useState} from 'react'
import styles from '../Controls/Controls.module.scss'
const Controls=(Props)=> {
       
       const triggerHit=()=>{
              Props.triggerHit()
       }

       const checkTurnHit = Props.casinoTurn? styles.casinoTurn : styles.hit
       const checkTurnStand = Props.casinoTurn? styles.casinoTurn : styles.stand
       const checkCheatDetection = Props.showReconstruct? styles.finalPayout: styles.detectCheating
     //   const checkPayout = Props.showFinalPayout? styles.finalPayout: styles.detectCheating

       return (
              <div className={styles.controlsContainerWrapper}>
                     <div className={styles.controlsContainer}>
                            <div className={checkTurnHit} onClick={triggerHit}>
                                   Hit
                            </div>
                            <div className={checkTurnStand} onClick={Props.triggerStand}>
                                   Stand
                            </div>
                            {(Props.showPayout)?<div className={checkCheatDetection} onClick={Props.reConstruct}>
                                   Detect cheating
                            </div>:null}
                            {(Props.showFinalPayout)?<div className={styles.hit} onClick={Props.finalPayout}>
                                   Payout
                            </div>:null}
                            
                     </div>
                     {(Props.showFinalPayout)?<div id={styles.seeHow}onClick={Props.showModal}>
                            See how your game works under the hood.
                     </div>:null}
              </div>
       )
}

export default Controls;
