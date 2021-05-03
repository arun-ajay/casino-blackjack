const BlackJack = artifacts.require("BlackJack_testing.sol");

const truffleAssert = require("truffle-assertions");

const gasFee = 20000000000;

contract('Should prevent other accounts to deposite', async accounts => {
  it("Should prevent other accounts to deposite", async () =>{
    let account_casino = accounts[0];
    let account_user = accounts[1];
    let depositeFund = 10000000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({from: account_casino});
    //user tries to deposite into smart contract(should not work) 
    truffleAssert.fails(
      instance.depositMoney({from: account_user, value: depositeFund})
    ); 
  }); 
});

contract('Should prevent other accounts from withdrawal', async accounts => {
    it("Should prevent other accounts from withdrawal", async () =>{
        let account_casino = accounts[0];
        let account_user = accounts[1];
        let depositeFund = 10000000000000000000;
    
        //casino deploys contract
        const instance = await BlackJack.deployed({from: account_casino});
        //casino deposites funds
        await instance.depositMoney({from: account_casino, value: depositeFund});
        //user tries to withdrawal from smart contract(should not work) 
        truffleAssert.fails(
          instance.withdrawMoney({from: account_user})
        ); 
      }); 
});

contract('Should Deposite 10ETH into Smart Contract', async accounts => {
    it("Should Deposite 10ETH into Smart Contract", async () =>{
        let account_casino = accounts[0];
        let depositeFund = 10000000000000000000;
  
        //casino deploys contract
        const instance = await BlackJack.deployed({from: account_casino});
        //obtain casino balance before deposite
        const casinoBalanceBefore = await web3.eth.getBalance(account_casino);
        console.log("casinoBalanceBefore = ", casinoBalanceBefore);
        //casino deposite money into smart contract
        const deposite = await instance.depositMoney({ from: account_casino, value: depositeFund });
        //calculate gas fee for deposite 
        const gasFeeforDeposite = deposite.receipt.gasUsed * gasFee;
        console.log("gasFeeforDeposite = ", gasFeeforDeposite);
        //calculate correct casino balance after deposite
        const correctCasinoBalanceAfter = 
          Number(casinoBalanceBefore) - Number(gasFeeforDeposite) - Number(depositeFund);
        console.log("correctCasinoBalanceAfter = ", correctCasinoBalanceAfter);
        //obtain casino balance after deposite
        const casinoBalanceAfter = await web3.eth.getBalance(account_casino);
        console.log("casinoBalanceAfter = ", casinoBalanceAfter);
        //assert smart contract balance = 10ETH  
        const smartContractBalance = await web3.eth.getBalance(instance.address);
        console.log("smartContractBalance = ", smartContractBalance);
        assert.equal(smartContractBalance, depositeFund);
        //assert fund was taken out from casino account balance 
        assert.equal(
          Math.round(correctCasinoBalanceAfter/ 1000000000000000000), 
          Math.round(casinoBalanceAfter/ 1000000000000000000)
        );
    });   
});

contract('Should withdraw money from smart Contract', async accounts => {
    it("Should withdraw money from smart Contract", async () =>{
        let account_casino = accounts[0];
        let depositeFund = 10000000000000000000;
        
        //casino deploys contract
        const instance = await BlackJack.deployed({from: account_casino});
        //casino balance before deposite 
        const casinoBalanceBeforeDeposite = await web3.eth.getBalance(account_casino);
        console.log("casinoBalanceBeforeDeposite = ", casinoBalanceBeforeDeposite);
        //casino deposite money into smart contract
        const deposite = await instance.depositMoney({ from: account_casino, value: depositeFund });
        //casino balance after deposite 
        const casinoBalanceAfterDeposite = await web3.eth.getBalance(account_casino);
        console.log("casinoBalanceAfterDeposite = ", casinoBalanceAfterDeposite);
        //casino withdraw money from smart contract
        const withdrawal = await instance.withdrawMoney({ from: account_casino });
        //gas fee for withdrawal
        const gasFeeforWithdrawal = withdrawal.receipt.gasUsed * gasFee;
        console.log("gasFeeforWithdrawal = ", gasFeeforWithdrawal);
        //obtain smart contract balance
        const smartContractBalance = await web3.eth.getBalance(instance.address);
        //obtain casino balance after withdraw
        const casinoBalanceAfterWithdrawl = await web3.eth.getBalance(account_casino);
        console.log("casinoBalanceAfterWithdrawl = ", casinoBalanceAfterWithdrawl);
        console.log("smartContractBalance = ", smartContractBalance);
        assert.equal(smartContractBalance, 0);
        assert.equal(
          Math.round(casinoBalanceBeforeDeposite / 1000000000000000000), 
          Math.round(casinoBalanceAfterWithdrawl / 1000000000000000000)
        );
    });
});
