const BlackJack = artifacts.require("BlackJack_testing.sol");

const truffleAssert = require("truffle-assertions");

const gasPrice = 20000000000;

var hashed_rCom1 = "0x79";
var hashed_rCom2 = "0x79";
var shuffledeck = new Array(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51);

contract('Player Action', async accounts => {

  it("Should allow the player to hit", async () =>{
    let account_casino = accounts[0];
    let account_user1 = accounts[1];
    let depositeFund = 10000000000000000000;
    let betAmount = 50000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ from: account_casino, value: depositeFund });
    //player starts a game
    await instance.initializeGame({ from: account_user1, value: betAmount });
    await instance.Casino_get_deck(account_user1, shuffledeck, hashed_rCom1, hashed_rCom2, { from: account_casino });
    await instance.distribute(account_user1, { from: account_casino });

    //set player's hand to hold 8 and 9
    await instance.setPlayerHand(account_user1, 7, 8, 100, 100, 100, 100, {from: account_casino});
    //set casino's hand to hold 8 and 9
    await instance.setCasinoHand(account_user1, 7, 8, 100, 100, 100, 100, {from: account_casino});
    
    //player calls Player_Hit function
    await instance.Player_Hit(account_user1, {from: account_user1});
    let newPlayerHand = await instance.getPlayerHandByKey(account_user1, {from: account_casino});
    console.log(newPlayerHand);
  });

  it("Should not allow the casino to hit", async () =>{
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

    //casino calls Player_Hit function
    truffleAssert.fails(
      instance.Player_Hit(account_user2, {from: account_casino})
    );
  });

  it("Should not allow the casino to stand", async () =>{
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

    //casino calls Stand function
    truffleAssert.fails(
      instance.Stand({from: account_casino})
    );
  });

  it("Should go to Casino_Turn phase after player stand", async () =>{
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

    await instance.Stand({ from: account_user4 });
    const Gamestate = await instance.getGamestateByKey.call(account_user4);
    assert.equal(Gamestate.toString(), 4);
  });

  it("Should not allow player to stand after they have over 21 points", async () =>{
    let account_casino = accounts[0];
    let account_user5 = accounts[5];
    let depositeFund = 10000000000000000000;
    let betAmount = 50000000000000000;
    let player5_total_card_value = 0;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ value: depositeFund });

    //player starts a game
    await instance.initializeGame({ from: account_user5, value: betAmount });
    await instance.Casino_get_deck(account_user5, shuffledeck, hashed_rCom1, hashed_rCom2, { from: account_casino });
    await instance.distribute(account_user5, { from: account_casino });

    const Gamestate = await instance.getGamestateByKey.call(account_user5);
    console.log("Test 5 gamestate = " + Gamestate);

    while(player5_total_card_value < 21){
      await instance.Player_Hit(account_user5, { from: account_user5 });
      player5_total_card_value = await instance.Player_check.call(account_user5);
      console.log("player5_total_card_value = " + player5_total_card_value);
    }

    await instance.setPlayerHand(account_user5, 5, 6, 7, 100, 100, 100, {from: account_casino});
    player5_total_card_value = await instance.Player_check.call(account_user5);
    console.log("player5_total_card_value = " + player5_total_card_value);

    truffleAssert.fails(
      instance.Stand({ from: account_user5 })
    );
  });

  it("Should go to reveal phase after player gets 21 points or gets over 21 points", async () =>{
    let account_casino = accounts[0];
    let account_user6 = accounts[6];
    let depositeFund = 10000000000000000000;
    let betAmount = 50000000000000000;
    let player6_total_card_value = 0;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ value: depositeFund });

    //player starts a game
    await instance.initializeGame({ from: account_user6, value: betAmount });
    await instance.Casino_get_deck(account_user6, shuffledeck, hashed_rCom1, hashed_rCom2, { from: account_casino });
    await instance.distribute(account_user6, { from: account_casino });
    player6_total_card_value = await instance.Player_check.call(account_user6);
    console.log("player6_total_card_value after distrubute = " + player6_total_card_value);

    console.log("user6 address =" + account_user6);

    while(player6_total_card_value < 21){
      await instance.Player_Hit(account_user6, { from: account_user6 });
      player6_total_card_value = await instance.Player_check.call(account_user6);
      //console.log("player6_total_card_value = " + player6_total_card_value);
    }
    
    if(player6_total_card_value == 21){
      await instance.Stand({ from: account_user6 });
      assert.equal(Gamestate.toString(), 4);
    }

    const Gamestate = await instance.getGamestateByKey.call(account_user6);
    console.log("Test 6 gamestate = " + Gamestate);
    assert.equal(Gamestate.toString(), 5);
  });

  it("Should allow the player to stand", async () =>{
    let account_casino = accounts[0];
    let account_user7 = accounts[7];
    let depositeFund = 10000000000000000000;
    let betAmount = 50000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ value: depositeFund });
    //player starts a game
    await instance.initializeGame({ from: account_user7, value: betAmount });
    await instance.Casino_get_deck(account_user7, shuffledeck, hashed_rCom1, hashed_rCom2, { from: account_casino });
    await instance.distribute(account_user7, { from: account_casino });

    //set player's hand to hold 8 and 9
    await instance.setPlayerHand(account_user7, 7, 8, 100, 100, 100, 100, {from: account_casino});
    //set casino's hand to hold 8 and 9
    await instance.setCasinoHand(account_user7, 7, 8, 100, 100, 100, 100, {from: account_casino});
    
    //player calls Player_Hit function
    await instance.Stand({from: account_user7});
    const Gamestate7 = await instance.getGamestateByKey.call(account_user7);
    console.log("Test 6 gamestate = " + Gamestate7);
  });

  // it("Player account balance check", async () =>{
  //   let account_casino = accounts[0];
  //   let account_user7 = accounts[7];
  //   let depositeFund = 10000000000000000000;
  //   let betAmount = 50000000000000000;
  //   let player7_total_card_value = 0;

  //   //casino deploys contract
  //   const instance = await BlackJack.deployed({ from: account_casino });
  //   //casino deposite money into smart contract
  //   await instance.depositMoney({ value: depositeFund });
  //   //obtain player balance before starting the game
  //   const playerBalanceBefore = await web3.eth.getBalance(account_user7);
  //   //player starts a game
  //   await instance.initializeGame({ from: account_user7, value: betAmount });
  //   await instance.Casino_get_deck(account_user7, { from: account_casino });
  //   await instance.distribute(account_user7, { from: account_casino });


  //   console.log("user7 address =" + account_user7);
  //   while(player7_total_card_value < 21){
  //     await instance.Player_Hit({ from: account_user7 });
  //     player7_total_card_value = await instance.Player_check.call(account_user7);
  //     console.log("player7_total_card_value = " + player7_total_card_value);
  //   }
  
  //   if(player7_total_card_value == 21){
  //     await instance.Stand({ from: account_user7 });
  //   }

  //   let gameState = await instance.getGameStateByKey.call(account_user7);
  //   console.log("test 7: gameState for Test7 =" + gameState);
  //   let gameResult = await instance.getGameResultByKey.call(account_user7);
  //   console.log("test 7: gameResult for Test7 =" + gameResult);

  //   await instance.Stand({from: account_user7});
  //   await instance.Casino_Turn(account_user7, {from: account_casino});

  //   gameResult = await instance.getGameResultByKey.call(account_user7);
  //   console.log("test 7: gameResult for Test7 =" + gameResult);

  //   //obtain player balance after the game
  //   const playerBalanceAfter = await web3.eth.getBalance(account_casino);

  //   console.log("test 7: playerBalanceBefore =" + playerBalanceBefore);
  //   console.log("test 7: playerBalanceAfter =" + playerBalanceAfter);

  // });
});
