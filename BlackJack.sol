pragma solidity 0.6.6;

contract BlackJack{
    address public casino;
    uint256[52] private deck;
    //In phrase playerAction, only player can call function like(hit, stand, split)
    //In phrase casinoAction, only casino can call function like(Casino_action, CasinoCommit)
    enum GameState {Inactive, Deck_shuffle, Car_Distribution, Player_Turn, UserCommit, Reveal}
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
        //Generate random number for other public key and private key
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
    //Shuffle the card
        //player can view their current cards
    function Reveal_card() external view{
    }
    //player draws a card
    //only for player
    function Hit() external{
        require(
            msg.sender != casino,
            "Only player can call this function"
        );
        require(
             mapGamestate[msg.sender] == GameState.Player_Turn,
             "Casino has not distribute the card yet"
             );
        uint256 deck_index = mapPlayerDeckindex[msg.sender];
        uint256 player_index = mapPlayer_card_num[msg.sender];
        mapPlayer_card[msg.sender][player_index] = mapPlayerDeck[msg.sender][deck_index];
        mapPlayerDeckindex[msg.sender] += 1;
        mapPlayer_card_num[msg.sender] += 1;
    }
    function Casino_Hit(address player) private{
        require(
             mapGamestate[msg.sender] == GameState.UserCommit,
             "Player has not finish yet"
             );
        uint256 deck_index = mapPlayerDeckindex[player];
        uint256 casino_index = mapCasino_card_num[player];
        mapCasino_card[player][casino_index] = mapPlayerDeck[player][deck_index];
        mapPlayerDeckindex[player] += 1;
        mapCasino_card_num[player] += 1;
        Casino_check(player);
    }
    //only for player
    function Stand() external{
         require(
            msg.sender != casino,
            "Only player can call this function"
        );
         require(
             mapGamestate[msg.sender] == GameState.Player_Turn,
             "Casino has not distribute the card yet"
             );
         mapGamestate[msg.sender] = GameState.UserCommit;
        
    }
    
    //check the total value of either casino or player
    function Player_check(address player) private{
        uint256 total = 0;
        for (uint256 i = 0; i < mapPlayer_card_num[player]; i ++){
            total += mapPlayer_card[player][i] % 13;
        }
        if (total > 21){
            Casino_Win(player);
            mapGamestate[player] = GameState.Reveal;
        }
    }
    //similar to phase 4
    function Casino_check(address player) private{
        uint256 total = 0;
        for (uint256 i = 0; i < mapCasino_card_num[player]; i ++){
            total += mapCasino_card[player][i] % 13;
        }
        if(total == 21){
            Casino_Win(payable(player));
        }
        else if (total > 21){
            Player_Win(payable(player));
        }
        else if (total < 17){
            Casino_Hit(player);
        }else{
            mapGamestate[player] = GameState.Reveal;
        }
            
    }
    function compare(address player) private view returns(bool){
        uint256 player_total = 0;
        uint256 casino_total = 0;
        for (uint256 i = 0; i < mapPlayer_card_num[player]; i ++){
            player_total += mapPlayer_card[player][i] % 13;
        }
        for (uint256 i = 0; i < mapCasino_card_num[player]; i ++){
            casino_total += mapCasino_card[player][i] % 13;
        }
        if(player_total > casino_total){
            return true;
        }else{
            return false;
        }
    }
    function Check_Split(address player) private view returns(bool){
        uint256 first = mapPlayer_card[player][0] % 13;
        uint256 second = mapPlayer_card[player][1] % 13;
        if (first == second){
            return true;
        }
        return false;
    }
    function split() external payable{
       require(
           Check_Split(msg.sender), "You can not split the game with current holding cards"
           );
       require(
            msg.sender != casino,
            "Casinos cannot split a game"
        );    
    }
    //This is phase 1
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
        //clear up the car value
        for (uint256 i = 0; i < 12; i ++){
            mapPlayer_card[msg.sender][i] = 0;
            mapCasino_card[msg.sender][i] = 0;
        }
        mapGamestate[msg.sender] = GameState.Deck_shuffle;
        mapBet[msg.sender] = msg.value;
        mapGameResult[msg.sender] = GameResult.InProgress;
        payable(address(this)).transfer(mapBet[msg.sender]);
    }
    //This is phase 2
    //pass the card to the mapPlayerDeck
    function Casino_get_deck(address user) external{
         require(
            msg.sender == casino,
            "Only casino can call this function"
        );
        require(
            mapGamestate[user] == GameState.Deck_shuffle,
            "Play needs to initilize the game"
            );
        mapGamestate[user] = GameState.Car_Distribution;
    }
    //This is phase 3
    function Casino_distribution(address user) external {
         require(
            msg.sender == casino,
            "Only casino can call this function"
        );
         require(
            mapGamestate[user] == GameState.Car_Distribution,
            "Play needs to initilize the game"
            );
        Casino_check(user);
        mapGamestate[msg.sender] = GameState.Player_Turn;
    }
    //This is phase 5
    //check the total value of player's car
    function Player_Turn(address user) external{
         require(
            msg.sender != casino,
            "Casinos cannot play a game with themselves"
        );
         require(
            mapGamestate[msg.sender] == GameState.Player_Turn,
            "require to finish previous phase before reaching the Player_Turn"
        );
        Player_check(user);
    }
    //This is phase 6
    function Casino_Turn(address player) external{
         require(
            msg.sender == casino,
            "Only casino can call this function"
        );
        require(
            mapGamestate[msg.sender] == GameState.UserCommit,
            "require to finish previous phase before reaching the Player_Turn"
        );
        Casino_check(player);
        Reveal(player);
    }
     //print the outcome
    function Reveal(address player) public{
         require(
            mapGamestate[player] == GameState.Reveal,
            "This user's game is not ready for the reveal phase"
        );
        if(compare(player)){
            Player_Win(payable(player));
        }else{
            Casino_Win(player);
        }
    }
    //Smart contract keep the money
    function Casino_Win(address player) private{
        mapGamestate[player] = GameState.Inactive;
        mapGameResult[player] = GameResult.Lost;
        mapBet[player] = 0;
    }
    //Smart contract transfer the money to the casino
    function Player_Win(address payable player) private{
        mapGamestate[player] = GameState.Inactive;
        mapGameResult[player] = GameResult.Won;
        payable(player).transfer(mapBet[player] * 2);
        mapBet[player] = 0;
    }
    
    receive() external payable {
        require(msg.data.length == 0);
    }
     function getBetByKey(address _user) public view returns (uint256) {
        return mapBet[_user];
    }
    
}
