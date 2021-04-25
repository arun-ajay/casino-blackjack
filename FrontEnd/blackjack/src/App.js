import React, {useState} from 'react'
import DealerHand from '../src/Components/DealerHand/DealerHand'
import UserHand from '../src/Components/UserHand/UserHand'
import Prompt from '../src/Components/Prompt//Prompt'
import Card from '../src/Components/Card/Card'
import Controls from '../src/Components/Controls/Controls'
import GameContainer from '../src/Components/GameContainer/GameContainer'
import styles from '../src/App.module.scss'

function App() {
       const [message, setMessage]= useState('Default Alert')

       const [userCards, setUserCards]= useState([])
       const [userScore, setUserScore]= useState(0)

       const [dealerCards, setDealerCards]= useState([])
       const [dealerScore, setDealerScore]= useState(0)

       const [balance, setBalance]= useState(100)
       const [bet, setBet]= useState(0);


  return (
         <div className={styles.App}>
              <GameContainer />
         </div>
  );
}

export default App;
