const BlackJack = artifacts.require("BlackJack_testing.sol");

const AssertionError = require("assertion-error");
const truffleAssert = require("truffle-assertions");

const gasPrice = 20000000000;

const depositeFund = 10000000000000000000;

contract('Casino Action', async accounts => {

  it("Should keep hitting before getting to 17 or above", async () =>{
    let account_casino = accounts[0];
    let account_user1 = accounts[1];
    let depositeFund = 10000000000000000000;
    let betAmount = 50000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ value: depositeFund });
    //player starts a game
    await instance.initializeGame({ from: account_user1, value: betAmount });
    await instance.Casino_get_deck(account_user1, { from: account_casino });
    await instance.distribute(account_user1, { from: account_casino });

    //set player's hand to hold 8 and 9
    await instance.setPlayerHand(account_user1, 7, 8, 100, 100, 100, 100, {from: account_casino});
    await instance.Stand({ from: account_user1 });

    let casino_hand_before = await instance.Casino_check(account_user1, { from: account_casino });
    console.log("casino_hand_before = " + casino_hand_before);

    await instance.Casino_Turn(account_user1, {from: account_casino});

    let casino_hand_After = await instance.Casino_check(account_user1, { from: account_casino });
    console.log("casino_hand_After = " + casino_hand_After);

    assert(casino_hand_After >= 17);
  }); 

  it("Should go to Reveal if casino gets 17 points or above", async () =>{
    let account_casino = accounts[0];
    let account_user2 = accounts[2];
    let depositeFund = 10000000000000000000;
    let betAmount = 50000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ value: depositeFund });
    //player starts a game
    await instance.initializeGame({ from: account_user2, value: betAmount });
    await instance.Casino_get_deck(account_user2, { from: account_casino });
    await instance.distribute(account_user2, { from: account_casino });

    //set player's hand to hold 8 and 9
    await instance.setPlayerHand(account_user2, 7, 8, 100, 100, 100, 100, {from: account_casino});
    await instance.Stand({ from: account_user2 });

    let casino_hand_before = await instance.Casino_check(account_user2, { from: account_casino });
    console.log("casino_hand_before = " + casino_hand_before);

    await instance.Casino_Turn(account_user2, {from: account_casino});

    let casino_hand_After = await instance.Casino_check(account_user2, { from: account_casino });
    console.log("casino_hand_After = " + casino_hand_After);

    const Gamestate = await instance.getGamestateByKey.call(account_user2);
    console.log("Test 2 gamestate = " + Gamestate);
    assert.equal(Gamestate.toString(), 5);
  }); 

  it("Should pay player if player win", async () =>{
    let account_casino = accounts[0];
    let account_user3 = accounts[3];
    let depositeFund = 10000000000000000000;
    let betAmount = 50000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ value: depositeFund });
    //player starts a game
    await instance.initializeGame({ from: account_user3, value: betAmount });
    await instance.Casino_get_deck(account_user3, { from: account_casino });
    await instance.distribute(account_user3, { from: account_casino });

    const playerBalanceBefore = await web3.eth.getBalance(account_user3);
    console.log("playerBalanceBefore = " + playerBalanceBefore);

    //set player's hand to have 21
    await instance.setPlayerHand(account_user3, 5, 6, 7, 100, 100, 100, {from: account_casino});
    await instance.Stand({ from: account_user3 });

    //show player hand total

    await instance.Casino_Turn(account_user3, {from: account_casino});

    //set casino's hand to have 18
    await instance.setCasinoHand(account_user3, 4, 5, 6, 100, 100, 100, {from: account_casino});

    //show player hand total

    await instance.Payout(account_user3);
   
    const playerBalanceAfter = await web3.eth.getBalance(account_user3);
    console.log("playerBalanceAfter = " + playerBalanceAfter );
  });
  
  it("Should pay casino if player lose", async () =>{
    let account_casino = accounts[0];
    let account_user4 = accounts[4];
    let depositeFund = 10000000000000000000;
    let betAmount = 50000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ value: depositeFund });
    //player starts a game
    await instance.initializeGame({ from: account_user4, value: betAmount });
    await instance.Casino_get_deck(account_user4, { from: account_casino });
    await instance.distribute(account_user4, { from: account_casino });

    const casinoBalanceBefore = await web3.eth.getBalance(account_casino);
    console.log("casinoBalanceBefore = " + casinoBalanceBefore);

    //set player's hand to have 18
    await instance.setPlayerHand(account_user4, 4, 5, 6, 100, 100, 100, {from: account_casino});
    await instance.Stand({ from: account_user4 });

    await instance.Casino_Turn(account_user4, {from: account_casino});

    //set casino's hand to have 21
    await instance.setCasinoHand(account_user4, 5, 6, 7, 100, 100, 100, {from: account_casino});

    await instance.Payout(account_user4);
   
    const casinoBalanceAfter = await web3.eth.getBalance(account_casino);
    console.log("casinoBalanceAfter = " + casinoBalanceAfter );
  });    
  
});
