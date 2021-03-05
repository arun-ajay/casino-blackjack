pragma solidity 0.6.6;

contract BlackJack{
    address public casino;
    uint256[52] private deck;
    //In phrase playerAction, only player can call function like(hit, stand, split)
    //In phrase casinoAction, only casino can call function like(Casino_action, CasinoCommit)
    enum GameState {Inactive, playerAction, casinoAction, CasinoCommit, UserCommit, Reveal}
    enum GameResult {None,InProgress,Won,Lost}
    
    mapping(address => uint256[12]) mapPlayer_card;
    mapping(address => uint256[12]) mapCasino_card;
    //card number user to to input card to mapCasino_card or mapPlayer_card
    mapping(address => uint256) mapPlayer_card_num;
    mapping(address => uint256) mapCasino_card_num;
    mapping(address => uint256) private mapCasinoRandom;
    mapping(address => uint256) public mapCasinoHash;
    mapping(address => uint256) public mapBet;
    mapping(address => uint256[52]) mapPlayerDeck;
    mapping(address => bool) mapPlayerSplit;
    
    mapping(address => GameState) public mapGamestate;
    mapping(address => GameResult) public mapGameResult;
    
    uint256 public minBet = 0.001 ether;
    constructor() public {
        casino = msg.sender;
    }
    //Withdraw money from the smart contract
    function withdrawMoney() external {
        
    }
    //Deposite money to the smart contract
    function depositMoney() external payable {
    }
    //Check the maxbet value
    function maxBet() public view returns (uint256) {
    }
    //Split the card, pay the same amount of ether when user call the deal
    //Set mapPlayerSplit to true
    function split() external payable{
        require(
            mapGamestate[msg.sender] == GameState.playerAction || mapGamestate[msg.sender] == GameState.CasinoCommit,
            "You are not permitted to hit at this time."
        );
    }
    //Shuffle the card
    function shuffle() private{
        for(uint256 i = 1; i <= 52; i++){
            mapPlayerDeck[msg.sender][i -1] = i % 13 + 1;
        }
    }
    //Generate random number
    function Random() private{
        
    }
    //Draw a card from the deck
    function Draw(address user) private view returns(uint256){
       
        return mapPlayerDeck[user][0];
    }
    //player draws a card
    function Hit() external{
        require(
            msg.sender != casino,
            "Casinos cannot call this function"
        );
        require(
            mapGamestate[msg.sender] == GameState.playerAction || mapGamestate[msg.sender] == GameState.CasinoCommit,
            "You are not permitted to hit at this time."
        );
    }
    //check the total value of either casino or player
    function Check_total_value() private{
        
    }
    //player can view their current cards
    function Reveal_card() external view{
        
    }
    //same as initializeGame
    //player gets two cards
    //casino gets two cards, one is covered
    function Deal() external payable {
         require(
            msg.sender != casino,
            "Casinos cannot play a game with themselves"
        );
         require(
            mapGamestate[msg.sender] == GameState.Inactive,
            "You already have an active game. Please wait until that game is finished first"
        );
        require(
            msg.value <= maxBet() - msg.value,
            "You've exceeded the maximum possible bet of 2 ether"
        );
        require(msg.value >= minBet, "You must provide a minimum of 0.001 ether");
        for (uint256 i = 0; i < 12; i ++){
            mapPlayer_card[msg.sender][i] = 0;
            mapCasino_card[msg.sender][i] = 0;
        }
        shuffle();
        mapGamestate[msg.sender] = GameState.playerAction;
    }
    // If total value greater than 13, Stand. Else draw a card.
    function Casino_action(address user) external{
         require(
            msg.sender == casino,
            "Only casino can call this function"
        );
         require(
            mapGamestate[user] == GameState.casinoAction,
            "You already have an active game. Please wait until that game is finished first"
        );
        mapGamestate[msg.sender] = GameState.playerAction;
    }
    //Casino Stand for the rest of the turns
    function CasinoCommit(address user) external {
         require(
            msg.sender == casino,
            "Only casino can call this function"
        );
         require(
            mapGamestate[user] == GameState.casinoAction,
            "You already have an active game. Please wait until that game is finished first"
        );
        mapGamestate[msg.sender] = GameState.CasinoCommit;
    }
    //same as UserCommit
    function Stand() external{
         require(
            msg.sender != casino,
            "Only player can call this function"
        );
        require(
            mapGamestate[msg.sender] == GameState.playerAction || mapGamestate[msg.sender] == GameState.CasinoCommit,
            "You are not permitted to hit at this time."
        );
        if (mapGamestate[msg.sender] == GameState.CasinoCommit){
            mapGamestate[msg.sender] = GameState.Reveal;
        }else{
            mapGamestate[msg.sender] = GameState.UserCommit;
        }
    }
    //Compare the total value between casino and the player. 
    //Then transfer money from the smart contract to the winner.
    function Reveal(address payable user) external{
         require(
            mapGamestate[user] == GameState.Reveal,
            "This user's game is not ready for the reveal phase"
        );
        
        
        if(mapPlayerSplit[user] == true){
            mapGamestate[user] = GameState.playerAction;
        }else{
            mapGamestate[user] = GameState.Inactive;
        }
        
    }
    receive() external payable {
        require(msg.data.length == 0);
    }
    
}
