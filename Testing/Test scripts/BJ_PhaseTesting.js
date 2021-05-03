const BlackJack = artifacts.require("BlackJack_testing.sol");

const AssertionError = require("assertion-error");
const truffleAssert = require("truffle-assertions");

const gasPrice = 20000000000;
var Rcom1 = "0x79";
var Rcom2 = "0x79";
var deck = new Array(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,0);


contract('phase 1', async accounts => {

  it("Should be Inactive gameState", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[1];

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //obtain GameState from map
    const gameState = await instance.getGamestateByKey.call(account_user);
    assert.equal(gameState.toString(), 0);
  });

 it("Should set game state to next state after initialize", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[1];
    let depositeFund = 1000000000000000000;
    let betAmount = 100000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ from: account_casino, value: depositeFund });
    //player starts a game
    await instance.initializeGame({ from: account_user, value: betAmount });
    //obtain GameState from map
    const gameState = await instance.getGamestateByKey.call(account_user);
    assert.equal(gameState.toString(), 1);
  });

  it("Should set game result to stage 2 after initialize", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[2];
    let depositeFund = 1000000000000000000;
    let betAmount = 100000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ from: account_casino, value: depositeFund });
    //player starts a game
    await instance.initializeGame({ from: account_user, value: betAmount });
    //obtain GameState from map
    const gameResult = await instance.getGameResultByKey.call(account_user);
    assert.equal(gameResult.toString(), 1);
  });

  it("Should stop player from starting a second game", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[3];
    let depositeFund = 1000000000000000000;
    let betAmount = 100000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ value: depositeFund });
    //player start a game
    await instance.initializeGame({
      from: account_user,
      value: betAmount,
    });
    //player starts a second game(should not work)
    truffleAssert.fails(
      instance.initializeGame({ from: account_user, value: betAmount })
    );
  });

  it("Should not below min bet", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[4];
    let depositeFund = 1000000000000000000;
    let betAmount = 10000; //10000 wei

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ from: account_casino, value: depositeFund });
    //player start a game with too little bet
    truffleAssert.fails(
      instance.initializeGame({ from: account_user, value: betAmount })
    );
  });

  it("Check if the user address is pushed", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[4];
    let depositeFund = 1000000000000000000;
    let betAmount = 100000000000000000; //10000 wei
    let found = 0;
    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ from: account_casino, value: depositeFund });
    //player start a game with too little bet
    await instance.initializeGame({ from: account_user, value: betAmount });
    const account_list = await instance.getAddressKey.call();
    let length = account_list.length;
    var i;
    for (i = 0; i < account_list.length; i++) {
        if (account_list[i] == account_user) {
            found = 1;
            }
        }
    assert.equal(found , 1);
  });

  it("Check if the deck is being reset", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[6];
    let depositeFund = 1000000000000000000;
    let betAmount = 100000000000000000; //10000 wei
    var count = 0;
    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ from: account_casino, value: depositeFund });
    //player start a game with too little bet
    await instance.initializeGame({ from: account_user, value: betAmount });
    const casino_deck = await instance.getCasinoCardByKey.call(account_user);
    const player_deck = await instance.getPlayerCardByKey.call(account_user);
    var i;
    for (i = 0; i < 12; i++) {
        if (casino_deck[i] == 100) {
            count++;
            }
        }
    var j;
    for (j = 0; j < 12; j++) {
        if (player_deck[j] == 100) {
            count++;
            }
        }
    assert.equal(count , 24);
  });

  it("Check if the game is being reset", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[7];
    let depositeFund = 1000000000000000000;
    let betAmount = 100000000000000000; //10000 wei
    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ from: account_casino, value: depositeFund });
    //player start a game with too little bet
    await instance.initializeGame({ from: account_user, value: betAmount });
    const reset1 = await instance.getMapGameDeckindexByKey.call(account_user);
    const reset2 = await instance.getPlayerCardNumber.call(account_user);
    const reset3 = await instance.getCasinoCardNumber.call(account_user);
    const reset4 = await instance.getCasinoAceCount.call(account_user);
    const reset5 = await instance.getPlayerCardNumber.call(account_user);
    var x = Number(reset1) + Number(reset4) + Number(reset2) + Number(reset3) + Number(reset5);
    assert.equal(x , 0);

  });


  it("Should deduct user balance base on what the bet was", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[8];
    let depositeFund = 1000000000000000000;
    let betAmount = 50000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ value: depositeFund });
    //player starts a game
    const balanceBefore = await web3.eth.getBalance(account_user);
    let hash = await instance.initializeGame({
      from: account_user,
      value: betAmount,
    });
    const gasUsed = hash.receipt.gasUsed;

    //check address balance
    const balance = await web3.eth.getBalance(account_user);
    let balanceTest =
      Number(balance) + Number(betAmount) + Number(gasUsed) * Number(gasPrice);
    assert.equal(
      Math.round(balanceTest / 100000000000000000),
      Math.round(balanceBefore / 100000000000000000)
    );
  });

  it("Should not exceed max bet", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[5];
    let depositeFund = 1000000000000000000;
    let betAmount = 10000000000000000000; //10 ether

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    //casino deposite money into smart contract
    await instance.depositMoney({ from: account_casino, value: depositeFund });
    //player start a game with too much bet
    truffleAssert.fails(
      instance.initializeGame({ from: account_user, value: betAmount })
    );
  });
});

contract('phase 2', async accounts => {

  it("Should only be avaliable after initialize.", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[1];
    let depositeFund = 1000000000000000000;
    let betAmount = 50000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    await instance.depositMoney({ from: account_casino, value: depositeFund });
    //player start a game with too little bet
     truffleAssert.fails(
      instance.Casino_get_deck(account_user, {from: account_casino,})
      )
  });

  it("Should be in distribute phase after phase 2", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[1];
    let depositeFund = 1000000000000000000;
    let betAmount = 50000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    await instance.depositMoney({ from: account_casino, value: depositeFund });
    //player start a game with too little bet
    await instance.initializeGame({ from: account_user, value: betAmount });
    //obtain GameState from map
    await instance.Casino_get_deck(account_user, deck, Rcom1, Rcom2,  {from: account_casino,});
    const gameState = await instance.getGamestateByKey.call(account_user);
    assert.equal(gameState.toString(), 2);
  });

   it("Should only allow casino to call", async () => {
     let account_casino = accounts[0];
     let account_user = accounts[2];
     let depositeFund = 1000000000000000000;
     let betAmount = 50000000000000000;

     //casino deploys contract
     const instance = await BlackJack.deployed({ from: account_casino });
     await instance.depositMoney({ from: account_casino, value: depositeFund });
     //player start a game with too little bet
     await instance.initializeGame({ from: account_user, value: betAmount });
     //obtain GameState from map
     truffleAssert.fails(
      instance.Casino_get_deck(account_user, {from: account_user,})
      )
   });


  });

contract('phase 3', async accounts => {

  it("Should only be avaliable after phase 2.", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[1];
    let depositeFund = 1000000000000000000;
    let betAmount = 50000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    await instance.depositMoney({ from: account_casino, value: depositeFund });
    await instance.initializeGame({ from: account_user, value: betAmount });
    //player start a game with too little bet
     truffleAssert.fails(
      instance.distribute(account_user, {from: account_casino,})
      )
  });

  it("Should be in player turn phase after phase 3", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[2];
    let depositeFund = 1000000000000000000;
    let betAmount = 50000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    await instance.depositMoney({ from: account_casino, value: depositeFund });
    //player start a game with too little bet
    await instance.initializeGame({ from: account_user, value: betAmount });
    //obtain GameState from map
    await instance.Casino_get_deck(account_user, deck, Rcom1, Rcom2,  {from: account_casino,});
    await instance.distribute(account_user, {from: account_casino,})
    const gameState = await instance.getGamestateByKey.call(account_user);
    assert.equal(gameState.toString(), 3);
  });

   it("Should only allow casino to call", async () => {
     let account_casino = accounts[0];
     let account_user = accounts[3];
     let depositeFund = 1000000000000000000;
     let betAmount = 50000000000000000;

     //casino deploys contract
     const instance = await BlackJack.deployed({ from: account_casino });
     await instance.depositMoney({ from: account_casino, value: depositeFund });
     //player start a game with too little bet
     await instance.initializeGame({ from: account_user, value: betAmount });
     //obtain GameState from map
      await instance.Casino_get_deck(account_user, deck, Rcom1, Rcom2,  {from: account_casino,});
      truffleAssert.fails(
      instance.distribute(account_user, {from: account_user,})
      )
   });

   it("Should get casino ace count properly", async () => {
     let account_casino = accounts[0];
     let account_user = accounts[4];
     let depositeFund = 1000000000000000000;
     let betAmount = 50000000000000000;

     //casino deploys contract
     const instance = await BlackJack.deployed({ from: account_casino });
     await instance.depositMoney({ from: account_casino, value: depositeFund });
     //player start a game with too little bet
     await instance.initializeGame({ from: account_user, value: betAmount });
     //obtain GameState from map
     await instance.Casino_get_deck(account_user, deck, Rcom1, Rcom2,  {from: account_casino,});
     await instance.setDeck(account_user, 0, 13, 26, 39, 1);
     await instance.distribute(account_user, {from: account_casino,});
     const casinoAceCount = await instance.getCasinoAceCount.call(account_user);
     assert.equal(casinoAceCount.toString(), 2);
   });

   it("Should get player ace count properly", async () => {
     let account_casino = accounts[0];
     let account_user = accounts[5];
     let depositeFund = 1000000000000000000;
     let betAmount = 50000000000000000;

     //casino deploys contract
     const instance = await BlackJack.deployed({ from: account_casino });
     await instance.depositMoney({ from: account_casino, value: depositeFund });
     //player start a game with too little bet
     await instance.initializeGame({ from: account_user, value: betAmount });
     //obtain GameState from map
     await instance.Casino_get_deck(account_user, deck, Rcom1, Rcom2,  {from: account_casino,});
     await instance.setDeck(account_user, 0, 13, 26, 39, 1);
     await instance.distribute(account_user, {from: account_casino,});
     const playerAceCount = await instance.getPlayerAceCount.call(account_user);
     assert.equal(playerAceCount.toString(), 2);
   });

   it("Should go to reveal phase if casino hit 21 with first 2 card", async () => {
     let account_casino = accounts[0];
     let account_user = accounts[6];
     let depositeFund = 1000000000000000000;
     let betAmount = 50000000000000000;

     //casino deploys contract
     const instance = await BlackJack.deployed({ from: account_casino });
     await instance.depositMoney({ from: account_casino, value: depositeFund });
     //player start a game with too little bet
     await instance.initializeGame({ from: account_user, value: betAmount });
     //obtain GameState from map
     await instance.Casino_get_deck(account_user, deck, Rcom1, Rcom2,  {from: account_casino,});
     await instance.setDeck(account_user, 0, 11, 26, 39, 1);
     await instance.distribute(account_user, {from: account_casino,});
     const gameState = await instance.getGamestateByKey.call(account_user);
     assert.equal(gameState.toString(), 5);
   });


   it("Should go to reveal phase if player hit 21 with first 2 card", async () => {
     let account_casino = accounts[0];
     let account_user = accounts[7];
     let depositeFund = 1000000000000000000;
     let betAmount = 50000000000000000;

     //casino deploys contract
     const instance = await BlackJack.deployed({ from: account_casino });
     await instance.depositMoney({ from: account_casino, value: depositeFund });
     //player start a game with too little bet
     await instance.initializeGame({ from: account_user, value: betAmount });
     //obtain GameState from map
     await instance.Casino_get_deck(account_user, deck, Rcom1, Rcom2,  {from: account_casino,});
     await instance.setDeck(account_user, 2, 5, 26, 37, 1);
     await instance.distribute(account_user, {from: account_casino,});
     const gameState = await instance.getGamestateByKey.call(account_user);
     assert.equal(gameState.toString(), 5);
   });

   it("Should go to player turn if nobody hit 21", async () => {
     let account_casino = accounts[0];
     let account_user = accounts[8];
     let depositeFund = 1000000000000000000;
     let betAmount = 50000000000000000;

     //casino deploys contract
     const instance = await BlackJack.deployed({ from: account_casino });
     await instance.depositMoney({ from: account_casino, value: depositeFund });
     //player start a game with too little bet
     await instance.initializeGame({ from: account_user, value: betAmount });
     //obtain GameState from map
     await instance.Casino_get_deck(account_user, deck, Rcom1, Rcom2,  {from: account_casino,});
     await instance.setDeck(account_user, 2, 4, 7, 8, 1);
     await instance.distribute(account_user, {from: account_casino,});
     const gameState = await instance.getGamestateByKey.call(account_user);
     assert.equal(gameState.toString(), 3);
   });

contract('reveal phase', async accounts => {

  it("Should return lose properly", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[1];
    let depositeFund = 1000000000000000000;
    let betAmount = 50000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    await instance.depositMoney({ from: account_casino, value: depositeFund });
    //player start a game with too little bet
    await instance.initializeGame({ from: account_user, value: betAmount });
    //obtain GameState from map
    await instance.Casino_get_deck(account_user, deck, Rcom1, Rcom2,  {from: account_casino,});
    await instance.setDeck(account_user, 7, 8, 5, 6, 3);
    //player has 6+7=13 casino has 8+9=17
    await instance.distribute(account_user, {from: account_casino});
    await instance.Stand({from: account_user});
    await instance.Casino_Turn(account_user, {from: account_casino});
    await instance.Payout(account_user, {from: account_casino});
    const gameResult = await instance.getGameResultByKey.call(account_user);
    assert.equal(gameResult.toString(), 3);
  });

  it("Should return win properly", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[2];
    let depositeFund = 1000000000000000000;
    let betAmount = 50000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    await instance.depositMoney({ from: account_casino, value: depositeFund });
    //player start a game with too little bet
    await instance.initializeGame({ from: account_user, value: betAmount });
    //obtain GameState from map
    await instance.Casino_get_deck(account_user, deck, Rcom1, Rcom2,  {from: account_casino,});
    await instance.setDeck(account_user, 7, 8, 5, 6, 4);
    //player has 6+7+5=18 casino has 8+9=17
    await instance.distribute(account_user, {from: account_casino});
    await instance.Player_Hit(account_user, {from: account_user});
    await instance.Stand({from: account_user});
    await instance.Casino_Turn(account_user, {from: account_casino});
    await instance.Payout(account_user, {from: account_casino});
    const gameResult = await instance.getGameResultByKey.call(account_user);
    assert.equal(gameResult.toString(), 2);
  });

  it("Should return draw properly", async () => {
    let account_casino = accounts[0];
    let account_user = accounts[3];
    let depositeFund = 1000000000000000000;
    let betAmount = 50000000000000000;

    //casino deploys contract
    const instance = await BlackJack.deployed({ from: account_casino });
    await instance.depositMoney({ from: account_casino, value: depositeFund });
    //player start a game with too little bet
    await instance.initializeGame({ from: account_user, value: betAmount });
    //obtain GameState from map
    await instance.Casino_get_deck(account_user, deck, Rcom1, Rcom2,  {from: account_casino,});
    await instance.setDeck(account_user, 7, 8, 5, 6, 3);
    //player has 6+7+4=17 casino has 8+9=17
    await instance.distribute(account_user, {from: account_casino});
    await instance.Player_Hit(account_user, {from: account_user});
    await instance.Stand({from: account_user});
    await instance.Casino_Turn(account_user, {from: account_casino});
    await instance.Payout(account_user, {from: account_casino});
    const gameResult = await instance.getGameResultByKey.call(account_user);
    assert.equal(gameResult.toString(), 4);
  });
});
});