# FrontEnd Setup


## BEFORE CONTINUING
 - COMPLETE THE BACKEND INSTRUCTIONS [backend readme](https://github.com/arun-ajay/casino-blackjack/blob/main/BackEnd/README.md)


#### Step-by-step setup:

1. Make sure your terminal directory is set to `/FrontEnd/blackjack`
2. Make sure your MetaMask account is set to the **USER account NOT the Casino account**.
3. Copy the ABI that you have used in your `config.py` and `config.js` file. 
     - Place it inside the 'abi' variable inside:
          - `/Frontend/src/Abis/casinoAbi.js`
4. Similarly, place your deployed smart contract address into the `smartContractAddress` variable in:
     - `/Frontend/src/Config/config.js`
5. Now you need to install your node.js packages. 
     - > Run `npm install` on your terminal
6.  Your FrontEnd should be ready. 
     - Run 
          - If you use yarn: 
               > `yarn start`.   ('localhost:3000/') will open in your chrome browser.
          - If you use npm:
               > `npm start`.   ('localhost:3000/') will open in your chrome browser.

     


