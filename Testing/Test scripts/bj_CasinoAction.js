const BlackJack = artifacts.require("BlackJack_testing.sol");

const AssertionError = require("assertion-error");
const truffleAssert = require("truffle-assertions");

const gasPrice = 20000000000;

const depositeFund = 10000000000000000000;

var hashed_rCom1 = "0x79";
var hashed_rCom2 = "0x79";
var shuffledeck = new Array(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51);

contract('Casino Action', async accounts => {

  it("Should let casino keep hitting before getting to 17 or above", async () =>{
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
    await instance.Casino_get_deck(account_user1, shuffledeck, hashed_rCom1, hashed_rCom2, { from: account_casino });
    await instance.distribute(account_user1, { from: account_casino });

    //set player's hand to hold 8 and 9
    await instance.setPlayerHand(account_user1, 7, 8, 100, 100, 100, 100, {from: account_casino});
    await instance.Stand({ from: account_user1 });

    let casino_hand_before = await instance.Casino_check.call(account_user1, { from: account_casino });
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
    await instance.Casino_get_deck(account_user2, shuffledeck, hashed_rCom1, hashed_rCom2, { from: account_casino });
    await instance.distribute(account_user2, { from: account_casino });

    //set player's hand to hold 8 and 9
    await instance.setPlayerHand(account_user2, 7, 8, 100, 100, 100, 100, {from: account_casino});
    await instance.Stand({ from: account_user2 });

    let casino_hand_before = await instance.Casino_check.call(account_user2, { from: account_casino });
    console.log("casino_hand_before = " + casino_hand_before);

    await instance.Casino_Turn(account_user2, {from: account_casino});

    let casino_hand_After = await instance.Casino_check.call(account_user2, { from: account_casino });
    console.log("casino_hand_After = " + casino_hand_After);

    const Gamestate = await instance.getGamestateByKey.call(account_user2);
    console.log("Test 2 gamestate = " + Gamestate);
    assert.equal(Gamestate.toString(), 5);
  }); 

  it("Should pay player if player lose", async () =>{
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
    await instance.Casino_get_deck(account_user3, shuffledeck, hashed_rCom1, hashed_rCom2, { from: account_casino });
    await instance.distribute(account_user3, { from: account_casino });

    const casinoBalanceBefore = await web3.eth.getBalance(account_casino);
    console.log("casinoBalanceBefore = " + casinoBalanceBefore);

    //set player's hand to have 21
    await instance.setPlayerHand(account_user3, 5, 6, 7, 100, 100, 100, {from: account_casino});
    await instance.Stand({ from: account_user3 });

    await instance.Casino_Turn(account_user3, {from: account_casino});

    //set casino's hand to have 18
    await instance.setCasinoHand(account_user3, 4, 5, 6, 100, 100, 100, {from: account_casino});

    await instance.Payout(account_user3);

    await instance.withdrawMoney({from: account_casino});

    //show game result
    GameResult =  await instance.getGameResultByKey(account_user3, {from: account_casino});
    console.log("Test3 game result = " + GameResult);
   
    const casinoBalanceAfter = await web3.eth.getBalance(account_casino);
    console.log("casinoBalanceAfter = " + casinoBalanceAfter );
  });
  
  it("Should pay casino if player win", async () =>{
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
    await instance.Casino_get_deck(account_user4, shuffledeck, hashed_rCom1, hashed_rCom2, { from: account_casino });
    await instance.distribute(account_user4, { from: account_casino });

    const playerBalanceBefore = await web3.eth.getBalance(account_user4);
    console.log("playerBalanceBefore = " + playerBalanceBefore);

    //set player's hand to have 18
    await instance.setPlayerHand(account_user4, 4, 5, 6, 100, 100, 100, {from: account_casino});
    await instance.Stand({ from: account_user4 });

    await instance.Casino_Turn(account_user4, {from: account_casino});

    //set casino's hand to have 21
    await instance.setCasinoHand(account_user4, 5, 6, 7, 100, 100, 100, {from: account_casino});

    await instance.Payout(account_user4);

    GameResult =  await instance.getGameResultByKey(account_user4, {from: account_casino});
    console.log("Test4 game result = " + GameResult);
  

    const playerBalanceAfter = await web3.eth.getBalance(account_user4);
    console.log("playerBalanceAfter = " + playerBalanceAfter );
   
    
  });    
  
});
