
from web3 import Web3
import config
import random
import time
import asyncio
import sqlite3
from Crypto.Random import random

def generateRandomNumberWithHash():
       rComNum = random.getrandbits(512) #int
       rCom = bin(rComNum).split('b')[1] #string
       rComHash = str(Web3.keccak(text=rCom))

       hashBuild = []
       for index,char in enumerate(rComHash):
              if index == 0 or index == 1 or index == (len(rComHash) - 1):
                     continue
              else:
                     hashBuild.append(char)
       
       rComHash = "".join(hashBuild)
       rDBinaryList = []
       rd = ""
       for index,char in enumerate(rCom):
              if index == 312:
                     rd = "".join(rDBinaryList)
                     break
              else:
                     rDBinaryList.append(char)
       return {
              "rCom": rCom,
              "hash": rComHash,
              "rD": rd
       }
                     


w3 = Web3(Web3.HTTPProvider(config.infuraProvider))
accounts = w3.eth.account.privateKeyToAccount(config.casinoPrivateKey)
account = accounts.address
smartContractAddress= Web3.toChecksumAddress(config.smartContractAddress)
casinoContract = w3.eth.contract(address= smartContractAddress, abi= config.abi)
connection = sqlite3.connect(r"./blackjack.db")
cursor = connection.cursor()

def shuffleCards(shuffleArray):

    deck = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51]

    for index,val in enumerate(deck):
        deck[index],deck[shuffleArray[index]] = deck[shuffleArray[index]],deck[index]
    
    return deck

def getPhase2Games():
       temp = casinoContract.functions.getPhase2Games().call({'from': account})
       activeGames= []
       for x in temp:
              if x != '0x0000000000000000000000000000000000000000':
                     activeGames.append(x)
       
       return activeGames

async def asyncFunction(delay,func):
       await asyncio.sleep(delay)
       return func

async def phase2Response(activeGame,nonce):

       try:
              print("Processing game for {}:".format(str(activeGame)))

              cursor.execute("SELECT * FROM GAMEDATA WHERE [ADR] = ?",(activeGame,))
              
              gameData = cursor.fetchall()
              
              if len(gameData) > 1:
                     print("Error: More than one entry of data")
              elif len(gameData) == 0:
                     casinoData = generateRandomNumberWithHash()
                     cursor.execute("INSERT OR REPLACE INTO GAMEDATA VALUES (?,?,?,?,?)",tuple([activeGame,casinoData["rCom"],casinoData["rD"],casinoData["hash"],""]))
                     connection.commit()
                     print("\tCreated rcom, rd, and hash for casino. Waiting for player rp.")
              else:
                     gameData = gameData[0]
                     if len(gameData[4]) == 0:
                            print("\t Cannot create deck yet. Still waiting on player rp.")
                     else:
                            print("\t All data is present! Will now work on creating deck.")
                            cursor.execute("SELECT * FROM GAMEDATA WHERE [ADR] = ?",(activeGame,))
                            gameData = cursor.fetchall()
                            gameData = gameData[0]

                            rD = gameData[2]
                            rP = gameData[4]
                            rComHash = gameData[3]
                            rFyBuild = []

                            for i in range(312):
                                   if rD[i] == rP[i]:
                                          rFyBuild.append("0")
                                   else:
                                          rFyBuild.append("1")
                            rFy = "".join(rFyBuild)

                            binaryList = [rFy[i:i+6] for i in range(0, len(rFy), 6)]

                            shuffleList = []
                            for binaryNumber in binaryList:
                                   num = int(binaryNumber,2)
                                   shuffleList.append(num%52)
                            


                            shuffledDeck = shuffleCards(shuffleList)

                            transaction = await asyncFunction(1,casinoContract.functions.Casino_get_deck(activeGame,shuffledDeck,rComHash).buildTransaction({
                                   'from': account,
                                   'nonce': nonce
                            }))

                            signed_tx = await asyncFunction(1,w3.eth.account.sign_transaction(transaction, config.casinoPrivateKey))

                            response = await asyncFunction(1,w3.eth.send_raw_transaction(signed_tx.rawTransaction))
                            print("\tDone:",response)
                            nonce += 1
       except Exception as e:
              print(str(e))


nonce = w3.eth.getTransactionCount(account)
while True:
       print("- - - - - - - - - -")
       print("Scanning games...")
       print()
       phase2Games = getPhase2Games()
       print(phase2Games)
       if len(phase2Games) > 0:
              print("Games in phase 2 detected:")
              for game in phase2Games:
                     print("\t{}".format(str(game)))
              print()
              for game in phase2Games:
                     asyncio.run(phase2Response(game,nonce))
                     nonce += 1

       time.sleep(5)