from Crypto.Random import random

randomNum = random.getrandbits(512)

randomNumBin = bin(randomNum)

split = randomNumBin.split('b')
binary = split[1]

print(binary)

randomNum1 = random.getrandbits(312)

randomNumBin1 = bin(randomNum1)

split1 = randomNumBin1.split('b')
binary1 = split1[1]

print(binary1)
