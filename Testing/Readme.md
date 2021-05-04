We used JavaScript and truffle testing framework to implement and run our test script. We need a seperate smart contract for testing which is named "BlackJack_Testing.sol". The reason being that The reason being that we need to change some private maps and functions in our smart contract to public in order to access and manipulate them in our JavaScript test script. These maps and functions were made private in our smart contract due to security and accessibility reasons. Another reason for using a separate smart contract for testing is that we do not want randomness in our test, therefore instead of drawing from a random deck during the test, we created testing only setters to set the player and casino's hand to a desired values so we can predetermine the result of each game. 

The follow steps below demonstrates the complete process of setting up and compiling our test scipt:

1. Download Node.js at www.nodejs.org/en/
2. Install the downloaded package.
3. Open command prompt. (For windows you can press Window+R to open the "Run" box, then type in "cmd" to open the command prompt)
4. In terminal, type: npm version. A version of npm should be displayed, otherwise please troubleshoot accordingly
5. In terminal, type: sudo npm install -g truffle
6. In terminal, type: npm install --save-dev chai truffle-assertions, this will install the truffle-assertion package which is required for some of the test cases we created.
7. Create a folder somewhere
8. Change your directory in your terminal to the folder created in step 8 (type: cd folder_name in the terminal)
9. In terminal, type: truffle init, this command should initialize a folder for testing contracts
10. Open the folder that you created in step 7, copy and paste “truffle-config.js” to this folder. 
11. Open the folder that you created in step 7, you should see a folder called “test”, copy and paste all of our files in the "Test Script" folder on github to this folder
12. Open the folder that you created in step 7, you should see a folder called “migrations”, copy and paste "1_initial_migration.js" and "2_black_jack_testing.js" to this folder
13. Open the folder that you created in step 7, you should see a folder called “contract”, copy and paste our “BlackJack_Testing.sol” to this folder
14. Open the folder that you created in step 7, copy and paste our "truffl-config.js" file to the folder that you created, when alert prompt, click "Replace".
15. Open the folder that you created in step 7, go to "Migrations" folder, copy in "migration_coinflip.js" into this folder.
16. In terminal, type: truffle compile, this command will compile all smart contracts within the current folder.
17. In terminal, type: truffle test
18. You should be seeing the test result 😊.


Learn more about truffle-assertion package:
https://github.com/rkalis/truffle-assertions
https://kalis.me/assert-reverts-solidity-smart-contract-test-truffle/
