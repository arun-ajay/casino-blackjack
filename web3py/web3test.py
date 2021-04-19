from web3 import Web3
import config



w3 = Web3(Web3.HTTPProvider(config.infuraProvider))
smartContractAddress= Web3.toChecksumAddress(config.smartContractAddress)


print(w3.isConnected())

casinoContract = w3.eth.contract(address= smartContractAddress, abi= config.abi)
accounts = w3.eth.account.privateKeyToAccount(config.casinoPrivateKey)
account = accounts.address

#casino account
print(account)

#Slight difference in web3js and web3py. Instead of .methods, we use .functions 
print(casinoContract.functions.maxBet().call())
