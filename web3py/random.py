from Crypto.Random import random

randomNum = random.getrandbits(512)
print(randomNum)
print(type(randomNum)) #int

randomNumBin = bin(randomNum)
print(randomNumBin)
print(type(randomNumBin)) #string

split = randomNumBin.split('b')
print(split)
binary = split[1]

binaryList = []
for index,char in enumerate(binary):
    if index == 52:
        break
    else:
        binaryList.append(int(char))

print(binaryList)