## FrontEnd v1. - Setup


### Make sure you have these:
 
 - [ ] MetaMask chrome extension (Ethereum wallet)
 - [ ] get an infura url by creating a project (https://infura.io/dashboard/ethereum)
 - [ ] A Casino private key (this account will deploy smart contract, fund it, and run the bots)
 - [ ] Smart Contract (use remix to deploy)
 - [ ] Deployed smart contract address


#### Step-by-step setup:

1. Make sure you have metamask extension & two seperate addresses.
2. Setup config files:
     - Place casino private key into 'casinoPrivateKey' variable in /Backend/config.py
     - Place casino private key into 'casinoPrivateKey' variable in /Backend/config.js
3. Open remix.ethereum.org, and deploy the smart contract inside of /Contract/Blackjack.sol
4. Use the 'depositMoney' function inside of remix to fund the smart contract with 1 ETH (= 1000 finney)
5. Grab your new project's infura url from https://infura.io/dashboard/ethereum
     - paste it into the 'infuraProvider' variable in /Backend/config.py
     - paste it into the 'infuraProvider' variable in /Backend/config.js
6. Copy the ABI
     - Place it inside the 'abi' variable inside:
          - /Backend/config.py
          - /Backend/config.js
          - /Frontend/src/Abis/casinoAbi.js

7. Paste your deployed smart contract address into the 'smartContractAddress' variable in:
     - /Frontend/src/Config/config.js
     - /Backend/config.py
     - /Backend/config.js

8. Use your terminal to change your directory to /Frontend/blackjack/
     - > npm install
9. Use your terminal to change your directory to /Backend
     - > python3 createDatabases.py (a 'blackjack.db' file will be created inside the directory after running this command.)
     -  NOTE: You'll have 5 different terminals open for
          - server.py
          - Phase2Bot.js
          - Phase3Bot.js
          - Phase5Bot.js
          - Phase7Bot.js
     - Use each terminal to run all 5 of these at the same time:
          - > python3 server.py
          - > node Phase2Bot.js
          - > node Phase3Bot.js
          - > node Phase5Bot.js
          - > node Phase7Bot.js
10. Use a seperate terminal to change your directory to /Frontend/blackjack
     - Run 
          - > yarn start ('localhost:3000/') will open in your chrome browser

     


