from Crypto.Random import random
from web3 import Web3



def rComBytes32():
       rComNum = random.getrandbits(512) #int
       rCom = bin(rComNum).split('b')[1] #string 
       rcomhex = Web3.soliditySha3(["string"],[rCom]).hex()
       return rcomhex


def rpBytes32():
       rp = random.getrandbits(312)
       rp = bin(rp).split('b')[1]
       rphex = Web3.soliditySha3(["string"],[rp]).hex()
       return rphex



print("RCOM BYTES 32:",rComBytes32())

print("RP BYTES 32:",rpBytes32())
