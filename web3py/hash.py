from web3 import Web3

hashInt = 10

kek = Web3.soliditySha3(["uint256", "uint256"], [123, 321])

print(kek)

print(kek.hex())
