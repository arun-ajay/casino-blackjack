from web3 import Web3
import config
import math
import random


w3 = Web3(Web3.HTTPProvider(config.infuraProvider))
smartContractAddress= Web3.toChecksumAddress(config.smartContractAddress)


print(w3.isConnected())

casinoContract = w3.eth.contract(address= smartContractAddress, abi= config.abi)
accounts = w3.eth.account.privateKeyToAccount(config.casinoPrivateKey)
myAddress = accounts.address
account = w3.eth.accounts[0]
#casino account
print(accounts)

#Slight difference in web3js and web3py. Instead of .methods, we use .functions 
#print(casinoContract.functions.maxBet().call())

def openCard():
    array = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51];
    currentIndex = len(array)
    while currentIndex != 0:
        randomIndex = math.floor(random.uniform(0, 1) * currentIndex);
        currentIndex = currentIndex - 1
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    return array

def getPhase3Games():
    activeGames = []
    temp = casinoContract.functions.getPhase3Games(myAddress).buildTransaction({
    'gas': 70000,
    'gasPrice': w3.toWei('1', 'gwei'),
    }).call()
    for i in range(len(temp)):
        if (temp[i] != '0x0000000000000000000000000000000000000000'):
           activeGames.append(temp[i])
    return activeGames
def phase3Response(activeGames):
    size = len(activeGames)
    activeGame = activeGames[0]
    if size > 0:
        print("Detected the following games")
        print(activeGames)
    for i in range(size):
        activeGame = activeGames[i]
        print("Distribute cards for user and dealer for address:",activeGame)
    gasPrice = w3.eth.generate_gas_price();
    gasEstimate = casinoContract.functions.distribute(activeGame).estimateGas()
    response = casinoContract.functions.distribute(activeGame).transact({'from': myAddress, 'to': activeGame, 'gasPrice': gasPrice})

    print("Done")
def phase3Bot():
    activeGames = getPhase3Games()
    print(activeGames)
    phase3Response(activeGames)    
phase3Bot()
    
    
