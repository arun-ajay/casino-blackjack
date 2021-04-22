from web3 import Web3
import config
import threading
import random
import asyncio


w3 = Web3(Web3.HTTPProvider(config.infuraProvider))
smartContractAddress= Web3.toChecksumAddress(config.smartContractAddress)


print(w3.isConnected())

casinoContract = w3.eth.contract(address= smartContractAddress, abi= config.abi)
accounts = w3.eth.account.privateKeyToAccount(config.casinoPrivateKey)

#casino account address
account = accounts.address
print(account)

def openCards():
       deck = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51];
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

def phase2Response(activeGames):

       if len(activeGames) > 0:
              print("Detected the following games")
              print(activeGames)
              print() 

       for x in activeGames:
              activeGame = x
              freshDeck = openCards()

              print('Creating fresh deck for user:', activeGame)
       
              gasPrice = w3.eth.generate_gas_price()
              print(account, activeGame)
              gasEstimate = casinoContract.functions.Casino_get_deck(activeGame, freshDeck).estimate_gas({'from': account, 'to':activeGame})
              response = casinoContract.functions.Casino_get_deck(activeGame, freshDeck).transact({'from': account, 'to': activeGame, 'gasPrice': gasPrice})

              print('Done!')
              print(response)
              print('')

def Phase2Bot():
       threading.Timer(5.0, Phase2Bot).start()
       activeGames = getPhase2Games()
       print(activeGames)
       phase2Response(activeGames)

Phase2Bot()





