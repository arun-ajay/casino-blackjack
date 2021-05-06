## FrontEnd v1. - Setup


### Make sure you have the Backend ready first.
 - see [backend readme](https://github.com/arun-ajay/casino-blackjack/blob/main/BackEnd/README.md)

### Prerequisits:

 - [ ] Backend (bots and other scripts)
 - [ ] Infura url (https://infura.io/dashboard/ethereum)
 - [ ] A Casino private key (this account will deploy smart contract, fund it, and run the bots)
 - [ ] Smart Contract (use remix to deploy)
 - [ ] Deployed smart contract address


#### Step-by-step setup:

1. Make sure you have metamask extension & two seperate addresses.
2. Open remix.ethereum.org, and deploy the smart contract inside of /Contract/Blackjack.sol
6. Copy the smart contract's ABI 
     - Place it inside the 'abi' variable inside:
          - /Frontend/src/Abis/casinoAbi.js
7. Paste your deployed smart contract address into the 'smartContractAddress' variable in:
     - /Frontend/src/Config/config.js
8. Use your terminal to change your directory to /Frontend/blackjack/
     - > npm install
10. Use a seperate terminal to change your directory to /Frontend/blackjack
     - Run 
          - If you use yarn: 
               > yarn start.   ('localhost:3000/') will open in your chrome browser.
          - If you use npm:
               > npm start.   ('localhost:3000/') will open in your chrome browser.

     


