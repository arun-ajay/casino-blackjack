from web3 import Web3

hashInt = 10

kek = Web3.soliditySha3(["string"], ["1111110010111100100001001001000111111110111001101001111001101110010001011110010000100011001110110101011001000000111001011110111110000011101011000011111110011111101011000010011101000101011110000101001101001111010101111110100110011110110011011111010100010110011001011101110100111100110001111001000101110011110000111110000111111001100111101001010001100001110011101110010011000101100000100000010000011000110001101100011001011011100110111001110101010011010000101011111100000110001101111000010111010101110010010011001"])

print(kek)

print(kek.hex())
