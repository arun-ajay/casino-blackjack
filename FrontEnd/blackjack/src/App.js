import React from 'react'
import GameContainer from '../src/Components/GameContainer/GameContainer'
import styles from '../src/App.module.scss'
import {getrcom, sendrp, gethash} from '../src/Utils/api'

function App() {
              
       const getRCOM = (userAddress)=>{
              //address should be string
              let body = {"address":userAddress}

              getrcom(body)
              .then((response)=>{
                     console.log(response.data.rcom)
              })
              .catch((error)=>{
                     console.log(error)
              })    
       }
       
       const sendRP=(userAddress, rP)=>{
              let body = {"address":userAddress, "rp": rP }

              sendrp(body)
              .then((response)=>{
                     console.log(response)
              })
              .catch((error)=>{
                     console.log(error)
              })
       }

       const getHASH=(userAddress)=>{
              let body = {"address":userAddress}

              gethash(body)
              .then((response)=>{
                     console.log(response)
              })
              .catch((error)=>{
                     console.log(error)
              })
       }


  return (
         <div className={styles.App}>
              <GameContainer />
         </div>
  );
}

export default App;
