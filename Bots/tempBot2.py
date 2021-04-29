from web3 import Web3
import config
import random
import time
import asyncio
import sqlite3
from Crypto.Random import random



def shuffleCards(shuffleArray):

    deck = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51]

    for index,val in enumerate(deck):
        deck[index],deck[shuffleArray[index]] = deck[shuffleArray[index]],deck[index]
    
    return deck



try:

       connection = sqlite3.connect("blackjack.db")
       cursor = connection.cursor()
       
       activeGame = "0x2372F830e274e0f4B5CD7710d519B60eA06007CB"


       cursor.execute("SELECT * FROM GAMEDATA WHERE [ADR] = ?",(activeGame,))
       
       gameData = cursor.fetchall()

       gameData = gameData[0]
       if len(gameData[5]) == 0 or len(gameData[6]) == 0:
              
              print("\t Cannot create deck yet. Still waiting on player rp1 and rp2.")
       else:
              
              print("\t All data is present! Will now work on creating deck.")

              rCom1 = gameData[1]
              print(len(rCom1))
              rCom2 = gameData[2]
              print(len(rCom2))
              rP1 = gameData[5]
              rP2 = gameData[6]
              rCom1Hash = str(gameData[3])
              rCom2Hash = str(gameData[4])
              rFyBuild = []

              rD = rCom1 + rCom2
              rP = rP1 + rP2

              

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
              print(shuffledDeck)
except Exception as e:
       print(str(e))

