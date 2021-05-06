# Phase 2/3/5/7 Bots for Casino & Deposit Ethereum Script AND Python Server

## Overview
<p>We've created several casino "bots" that are intended to act on behalf of the casino for phase 2/3/5/7. In addition, we wrote a simple script that can be executed anytime so that the casino can deposit 1 or more Ether into the smart contract. Finally, there is a server that we have created using Flask and Sqlite to retain the interaction between the user and casino outside of the smart contract.</p>

### Config.js and Config.py Setup

There is quite a bit of setup before we can get the bots, script and server fully running. 
We will require the smart contract address,smart contract ABI, private key for the casino wallet, and link for the Web3 provider. 
We need to create a `config.js` file that will hold the aforementioned information. Please rename `config-template.js` to `config.js`.
In addition, we need to create a `config.py` file that will hold the aforementioned information. Please rename `config-template.py` to `config.py`.

### Smart Contract ABI

When you are on the Remix IDE, please compile the `Blackjack.sol` file located in `Contract\`**but**, make sure you click on `Enable Optimization`. Once compiled, there should be a button to copy the ABI on the left column panel. Click that button and you will temporarily copy the smart contract ABI. Then head over to your `config.js` file and set the variable for `abi` equal to whatever you have just copied. `abi` should be stored as a list, when you copy the abi, it will already be in list form. Do the same for `config.py`.
### Smart Contract Address

After compiling your `Blackjack.sol` file, open up your MetaMask browser extension and sign in. Make sure you are on the account for which you want to act as the casino. Click on the deploy button and make sure your environment is set to `Injected Web3`. Finally, deploy the contract; you should expect MetaMask to pop up prompting you to approve a minor gas fee. After the contract is deployed, you should see your deployed contract. Copy the address of the deployed contract and store that in your `config.js` file for the variable `smartContractAddress`. `smartContractAddress` should be stored as a string. Do the same for `config.py`.

### Casino Wallet Private Key

Since you are deploying the contract using your casino wallet, you want to be able to access certain functions that are only present for the casino. For this to happen, we will also need access to the casino wallet. To get the private key, click on your MetaMask browser extension. Make sure your account is for the casino wallet. Click on the `⋮` symbol, then click on `Account Details`. From there, click on `Export Private Key`. Input your password and retrieve the private key. Assign that value to `casinoPrivateKey` in your `config.js` file and `config.py` file. `casinoPrivateKey` should be stored as a string. 

### Web3 Provider

You'll need a Web3 Provider to access the Ropsten network. Go to [infura.io](https://infura.io) and create an account. After that is done click on `Dashboard` on the top right. On the left panel click on `Ethereum`. Then click on `CREATE NEW PROJECT` on the right side. After writing down a name, you'll see a section called `KEYS`. Make sure sure your `ENDPOINTS` is set to `Ropsten` NOT `Mainnet`. Finally, copy the link below that starts with `https://ropsten.infura.io/... `. Replace your `web3Provider` variable with this information in your `config.js` file and `config.py` file. `web3Provider` should be stored as a string. 

### Initializing your node_modules packages

Next you have to get the packages pertinent for our bots and deposit script. Make sure you are within the `BackEnd\` folder. Be sure you have `Node.JS and NPM installed` installed. You can install them [here](https://www.npmjs.com/get-npm) . Write the following command...

```terminal
npm install
```

There are quite a few packages to install, please wait for it to install to completion.

**NOTE: IF ANYTHING WENT WRONG DURING INSTALLATION (You see installations that have failed) DELETE THE `node_modules` FOLDER IN `BackEnd` AND `package-lock.json`**

### Initializing your python environment, database and server 

**NOTE: MUST HAVE A BRAND NEW TERMINAL

To avoid conflicts with your own system, you must create your own Python environment to hold your packages. 
Also, we'll have to set up a database for our server beforehand. 
Please follow the following instructions in your terminal and make sure you are within the `BackEnd\` folder. 
*Please note: Some systems may differ. For example, may have to use `python3 server.py` in instead of `python server.py`*

```terminal
python -m venv env
. env/Scripts/activate
pip install -r requirements.txt
python createDatabases.py
python server.py
```
You should see the following output on your terminal once you run your server.
```terminal
 * Serving Flask app "server" (lazy loading)
 * Environment: production
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a production WSGI server instead.
 * Debug mode: on
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: 322-546-227
 * Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)
 ```

At this point, you can leave the server alone. It will behave on its own accord. 

### Firing up your Node.js Casino Bots 
**NOTE: EACH BOT MUST HAVE A BRAND NEW TERMINAL. DO NOT USE THE TERMINAL WHERE YOU RAN `npm install`**
If you followed the above directions carefully you can now deploy your bot. This is capable of running 24/7 and will scan for games that are in phase 2/3/5/7 every 5 seconds. To run a bot, simply type the following command on the terminal:

```terminal
node phase2Bot.js
```

You should see the following output:
```terminal
web3-shh package will be deprecated in version 1.3.5 and will no longer be supported.
web3-bzz package will be deprecated in version 1.3.5 and will no longer be supported.
web3 is connected
```

Do the same for your phase 3,5 and 7 bots. Each of these bots will process the game if the player is in a specific gamestate. 

### Depositing Ethereum
This script is executed one time and is adjustable. On Line 28 of `deposit.js` adjust the amount, but make sure that it is in string form. 

To run the script, simply type the following command on the terminal:
```terminal
node depositEther.js
```

You should expect a response in JSON form that relays information such as `blockHash` and `from`.


Please note that transactions may take 10-30 seconds to process. 



**You're now ready to interact continue with the FrontEnd instructions! 😊**
