
import time

from web3 import Web3
import config


w3 = Web3(Web3.HTTPProvider(config.infuraProvider))
smartContractAddress = Web3.toChecksumAddress(config.smartContractAddress)

print(w3.isConnected())

casinoContract = w3.eth.contract(address=smartContractAddress, abi=config.abi)
accounts = w3.eth.account.privateKeyToAccount(config.casinoPrivateKey)
account = accounts.address


def getPhase5Games():
    temp = casinoContract.functions.getPhase5Games().call({'from': account})
    activeGames = []
    for i in temp:
        if i != "0x0000000000000000000000000000000000000000":
            activeGames.append(i)

    return activeGames


def phase5Response(activeGames):
    if len(activeGames) > 0:
        print("Detected the following games")
        print(activeGames)

    for i in activeGames:
        activeGame = i
        print("Commiting casino actions...", activeGame)
        gasPrice = w3.eth.generate_gas_price()
        nonce = w3.eth.getTransactionCount(account)
        transaction = casinoContract.functions.Casino_Turn(
            activeGame).buildTransaction({'nonce': nonce, 'from': account, 'to': activeGame})
        signed_tx = w3.eth.account.sign_transaction(
            transaction, config.casinoPrivateKey)
        response = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        print(response)


while True:
    print("Scanning games...")
    print()
    phase5Response(getPhase5Games())

    time.sleep(5)
