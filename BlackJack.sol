pragma solidity 0.6.6;

contract BlackJack{
    address public casino;
    uint256[52] private deck;
    //In phrase playerAction, only player can call function like(hit, stand, split)
    //In phrase casinoAction, only casino can call function like(Casino_action, CasinoCommit)
    enum GameState {Inactive, Casino_Check, UserCommit, CasinoCommit, Reveal}
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
    mapping(address => uint256) mapPlayerDeckindex;
    mapping(address => bool) mapPlayerSplit;
    mapping(address => uint256) mapPlayernum;
    mapping(address => GameState) public mapGamestate;
    mapping(address => GameResult) public mapGameResult;
    address[] addressKeys;
    uint256 public minBet = 0.001 ether;
    constructor() public {
        casino = msg.sender;
    }
        //Generate random number
    function Random() private{
        
    }
    //Withdraw money from the smart contract
    function withdrawMoney() external {
         require(
            msg.sender == casino,
            "Only the casino may withdraw money into the smart contract"
        );
        payable(msg.sender).transfer(maxBet());
    }
    //Deposite money to the smart contract
    function depositMoney() external payable {
         require(
            msg.sender == casino,
            "Only the casino may deposit money into the smart contract"
        );
        require(
            msg.value >= 1 ether
        );

        //User gives contract the ETH for bet
        payable(address(this)).transfer(msg.value);
    }
    //Check the maxbet value
    function maxBet() public view returns (uint256) {
        uint256 currentBalance = address(this).balance;

        uint256 boundMoney = 0;

        for (uint i=0; i < addressKeys.length; i++){
            boundMoney += getBetByKey(addressKeys[i]);
        }

        return currentBalance - 2*boundMoney;
    }
    //Split the card, pay the same amount of ether when user call the deal
    //Set mapPlayerSplit to true
    function split() external payable{
       
    }
    //Shuffle the card
    function shuffle() private{
        for(uint256 i = 0; i < 52; i++){
            mapPlayerDeck[msg.sender][i] = i % 13 + 1;
        }
    }
        //player can view their current cards
    function Reveal_card() external view{
    }

    //Draw a card from the deck
    function Draw(address user) private{
        uint256 deck_index = mapPlayerDeckindex[user];
        uint256 player_index = mapPlayer_card_num[user];
        mapPlayer_card[user][player_index] = mapPlayerDeck[user][deck_index];
    }
    //player draws a card
    //only for player
    function Hit() external{
        require(
            msg.sender != casino,
            "Only player can call this function"
        );
        require(
             mapGamestate[msg.sender] == GameState.Casino_Check,
             "Casino has not distribute the card yet"
             );
        address curr = msg.sender;
        Draw(curr);
        
    }
    //only for player
    function Stand() external{
         require(
            msg.sender != casino,
            "Only player can call this function"
        );
         require(
             mapGamestate[msg.sender] == GameState.Casino_Check,
             "Casino has not distribute the card yet"
             );
         mapGamestate[msg.sender] = GameState.UserCommit;
        
    }
    
    //check the total value of either casino or player
    function Player_check(address player) external{
        uint256 total = 0;
        for (uint256 i = 0; i < mapPlayer_card_num[player]; i ++){
            total = mapPlayer_card[player][i] % 13;
        }
        if (total > 21){
            Reveal(msg.sender);
        }
    }
    //same as initializeGame
    //player gets two cards
    //casino gets two cards, one is covered
    function itializeGame() external payable {
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
     
    }
    function Casino_distribution(address user) external {
         require(
            msg.sender == casino,
            "Only casino can call this function"
        );
       
        mapGamestate[msg.sender] = GameState.Casino_Check;
    }
    // If total value greater than 13, Stand. Else draw a card.
    function Casino_Turn(address user) external{
         require(
            msg.sender == casino,
            "Only casino can call this function"
        );
        
      
    }
    //Casino Stand for the rest of the turns
  
    //same as UserCommit
  
    //Compare the total value between casino and the player. 
    //Then transfer money from the smart contract to the winner.
    function Reveal(address payable user) public{
         require(
            mapGamestate[user] == GameState.Reveal,
            "This user's game is not ready for the reveal phase"
        );
        
        
    }
    receive() external payable {
        require(msg.data.length == 0);
    }
     function getBetByKey(address _user) public view returns (uint256) {
        return mapBet[_user];
    }
    
}
