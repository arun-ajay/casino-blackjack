from web3 import Web3
import config
import math
import random
import time


w3 = Web3(Web3.HTTPProvider(config.infuraProvider))
smartContractAddress = Web3.toChecksumAddress(config.smartContractAddress)


print(w3.isConnected())

casinoContract = w3.eth.contract(address=smartContractAddress, abi=config.abi)
accounts = w3.eth.account.privateKeyToAccount(config.casinoPrivateKey)
account = accounts.address
#account = w3.eth.accounts[0]
# casino account


# Slight difference in web3js and web3py. Instead of .methods, we use .functions
# print(casinoContract.functions.maxBet().call())


def openCard():
    array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
             26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]
    currentIndex = len(array)
    while currentIndex != 0:
        randomIndex = math.floor(random.uniform(0, 1) * currentIndex)
        currentIndex = currentIndex - 1
        temporaryValue = array[currentIndex]
        array[currentIndex] = array[randomIndex]
        array[randomIndex] = temporaryValue
    return array


def getPhase3Games():
    activeGames = []
    temp = casinoContract.functions.getPhase3Games().call({'from': account})
    for i in range(len(temp)):
        if (temp[i] != '0x0000000000000000000000000000000000000000'):
            activeGames.append(temp[i])
    return activeGames


def phase3Response(activeGames):

    if len(activeGames) > 0:
        print("Detected the following games")
        print(activeGames)
    for i in activeGames:
        activeGame = i
        print("Distribute cards for user and dealer for address:", activeGame)

        nonce = w3.eth.getTransactionCount(account)
        transaction = casinoContract.functions.distribute(activeGame).buildTransaction(
            {'nonce': nonce, 'from': account, 'to': activeGame})
        signed_tx = w3.eth.account.sign_transaction(
            transaction, config.casinoPrivateKey)
        response = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        print(response)
        print("Done")


while True:
    print("Scanning games...")
    print()
    phase3Response(getPhase3Games())

    time.sleep(5)
