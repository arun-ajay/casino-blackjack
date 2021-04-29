from web3 import Web3
import config
import random
import time
import asyncio
import sqlite3
from Crypto.Random import random


def shuffleCards(shuffleArray):

    deck = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
            26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]

    count = 0
    currentIndex = 52
    temporaryValue = 0

    while currentIndex != 0:
        randomIndex = shuffleArray[count]
        currentIndex = currentIndex - 1
        temporaryValue = deck[currentIndex]
        deck[currentIndex] = deck[randomIndex]
        deck[randomIndex] = temporaryValue
        count = count + 1

    return deck


def main():
    rD = "101100100111111000001100100011101011011010001110111001000111011110111101110010000111011110111010001101110110011110001101110100101011000111000110101000010110010110101110001100011011010000110101111010110111101011111001000000010110101011110101111011001000101110010101100011111100101001110000011000000001100111011100"
    rP = "100101111000110001010000101011010110101111100010100101100001100000111100010011101000010100110100001011011101001000000111111011101111111111100110001101100000100000100100101001100000000100010001110001110101101101111000111101100010111100011000000110110101100111111000011111000101001010001010100010111110010011111010"

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
        num = int(binaryNumber, 2)
        shuffleList.append(num % 52)

    shuffledDeck = shuffleCards(shuffleList)
    print(shuffledDeck)


main()
