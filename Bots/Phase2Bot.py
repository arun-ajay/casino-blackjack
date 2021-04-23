from web3 import Web3
# from web3.auto.infura import w3
from web3.middleware import construct_sign_and_send_raw_middleware
import config
import random
# import threading
# import asyncio
import time


w3 = Web3(Web3.HTTPProvider(config.infuraProvider))
print(w3.isConnected())
smartContractAddress= Web3.toChecksumAddress(config.smartContractAddress)

casinoContract = w3.eth.contract(address= smartContractAddress, abi= config.abi)
accounts = w3.eth.account.privateKeyToAccount(config.casinoPrivateKey)
account = accounts.address



print("Casino wallet",account)

def openCards():
       deck = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51]
       currentIndex = len(deck)

       random.shuffle(deck)
       
       return deck




def getPhase2Games():
       temp = casinoContract.functions.getPhase2Games().call({'from': account})
       activeGames= []

       for x in temp:
              if x != '0x0000000000000000000000000000000000000000':
                     activeGames.append(x)
       
       return activeGames

print("response",getPhase2Games())

def phase2Response(activeGame):

       print("\tProcessing game for {}".format(str(activeGame)))

       freshDeck = openCards() #DB AND SERVER LOGIC COMES INTO PLAY

       # gasPrice = w3.eth.generate_gas_price()
       # print(account)

       # gasEstimate = casinoContract.functions.Casino_get_deck(activeGame, freshDeck).estimateGas()

       # print(gasPrice,gasEstimate)

       # response = casinoContract.functions.Casino_get_deck(activeGame, freshDeck).transact({'gas': 42000, 'gasPrice': 21000})
       # gasPrice = w3.eth.getGasPrice()
       # gasEstimate = casinoContract.methods.Casino_Turn(activeGame).estimateGas({'from': account, 'to': activeGame})

       # response = casinoContract.functions.Casino_get_deck.send({
       #        'from': account, 'to': activeGame
       # })
       transaction = casinoContract.functions.Casino_get_deck(activeGame,freshDeck).buildTransaction({'from': account, 'to': activeGame, 'nonce': w3.eth.getTransactionCount(account)})
       signedTx = w3.eth.account.signTransaction(transaction,config.casinoPrivateKey)
       # print(signedTx.rawTransaction)
       txhash = w3.eth.sendTransaction(signedTx)
       #response = casinoContract.functions.Casino_get_deck(activeGame, freshDeck).transact({'to': activeGame})

       print('Done!')
       print(txhash)
       # print(response)
       print('')



while True:
       print("Scanning games...")
       print()
       phase2Games = getPhase2Games()
       if len(phase2Games) > 0:
              print("Games in phase 2 detected!")
              for game in phase2Games:
                     print("\t{}".format(str(game)))
              print()
              for game in phase2Games:
                     phase2Response(game)

       print()
       time.sleep(5)