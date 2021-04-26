from web3 import Web3
import config
import math
import random
import time
import asyncio

w3 = Web3(Web3.HTTPProvider(config.infuraProvider))
accounts = w3.eth.account.privateKeyToAccount(config.casinoPrivateKey)
account = accounts.address
smartContractAddress = Web3.toChecksumAddress(config.smartContractAddress)
casinoContract = w3.eth.contract(address=smartContractAddress, abi=config.abi)

def getPhase3Games():
    activeGames = []
    temp = casinoContract.functions.getPhase3Games().call({'from': account})
    for i in range(len(temp)):
        if (temp[i] != '0x0000000000000000000000000000000000000000'):
            activeGames.append(temp[i])
    return activeGames

async def asyncFunction(delay,func):
       await asyncio.sleep(delay)
       return func


async def phase3Response(activeGame,nonce):

       try:
              print("\tProcessing game for {}".format(str(activeGame)))
              print("\tDistributing cards for user and dealer for address:", activeGame)
              transaction = await asyncFunction(casinoContract.functions.distribute(activeGame).buildTransaction(
                     {'nonce': nonce, 'from': account, 'to': activeGame}))
              signed_tx = w3.eth.account.sign_transaction(
                     transaction, config.casinoPrivateKey)
              response = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
              print(response)
              print("\tDone")
              print()
       except: 
              print('failed')


nonce = w3.eth.getTransactionCount(account)

while True:

       print("Scanning games...")
       print()
       phase3Response(getPhase3Games(), nonce)
       nonce = nonce + 1

       time.sleep(5)
