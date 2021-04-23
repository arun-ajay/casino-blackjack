from Crypto.Random import random

randomNum = random.getrandbits(512)
print(randomNum)
print(type(randomNum))

randomNumBin = bin(randomNum)
print(randomNumBin)
print(type(randomNumBin))
