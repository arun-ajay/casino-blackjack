import React, {useState} from 'react'
import Web3 from 'web3'
import {casinoAbi} from '../../Abis/casinoAbi'
import styles from '../UserInputPanel/UserInputPanel.module.scss'
import {smartContractAddress} from '../../Config/config'

const UserInputPanel=(props)=> {


       const web3 = new Web3(Web3.givenProvider)
       const casinoContractAddress = smartContractAddress
       const casinoContract = new web3.eth.Contract(casinoAbi, casinoContractAddress)

       const [betAmount, setBetAmount]=useState(0)
       const [maxBet, setMaxBet]=useState('')
       const [displayMaxBet, setDisplayMaxBet]=useState(false)

       const getMax=async ()=>{
              let maxBet = await casinoContract.methods.maxBet().call({from: props.userAddress})
              let maxBetinETH = web3.utils.fromWei(maxBet)
              setMaxBet(maxBetinETH)
       }

       const showMaxBet=()=>{
              getMax()
              setDisplayMaxBet((prevState)=> !prevState)
       }

       const handleBetSet=(e)=>{
              e.preventDefault()

              setBetAmount(parseFloat(e.target.value))
       }

       const handleSubmission =(e)=>{
              //send data to game container component
              e.preventDefault()
              props.betAmount(betAmount)
       }

       return (
              <div className={styles.container}>
                   <form onSubmit={handleSubmission} id={styles.form}>
                          <label id={styles.formHeader}>Enter bet amount:</label>
                          <input id={styles.input} type="number" min="0.001" max="5" step="any" onClick={showMaxBet} onChange={handleBetSet}/>
                          {(maxBet)? <div>
                                 MAX BET: {maxBet} ETH
                          </div>: null}
                          <input type="submit" value="Submit" id={styles.submitButton}/>
                   </form>
              </div>
       )
}

export default UserInputPanel;
