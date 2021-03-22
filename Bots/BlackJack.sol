pragma solidity 0.6.6;

contract BlackJack{
    address public casino;
    uint256[52] private deck;

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
    mapping(address => uint256[52]) public  mapPlayerDeck;
    mapping(address => uint256) mapPlayerDeckindex;
    mapping(address => uint256) mapPlayernum;
    mapping(address => GameState) public mapGamestate;
    mapping(address => GameResult) public mapGameResult;
    address[] addressKeys;
    uint256 public minBet = 0.001 ether;
    constructor() public {
        casino = msg.sender;
    }

    //Withdraw money from the smart contract
    function withdrawMoney() external {
         require(
            msg.sender == casino,
            "Only the casino may withdraw money into the smart contract"
        );
        payable(msg.sender).transfer(address(this).balance);
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
        
        
    function getPhase2Games() public view returns(address[] memory) {
        require(msg.sender == casino,"You are not permitted to access this function");
        
        
        address[] memory phase2 = new address[](addressKeys.length);
        
        for (uint i=0; i<addressKeys.length; i++){
            if (mapGamestate[addressKeys[i]] == GameState.Deck_shuffle){
                phase2[i] = addressKeys[i];
            }
        }
        
        return phase2;
    }
    
    


    function getPhase3Games() public view returns(address[] memory) {
        require(msg.sender == casino,"You are not permitted to access this function");
        
        
        address[] memory phase3 = new address[](addressKeys.length);
        
        for (uint i=0; i<addressKeys.length; i++){
            if (mapGamestate[addressKeys[i]] == GameState.Car_Distribution){
                phase3[i] = addressKeys[i];
            }
        }
        
        return phase3;
    }
    
    


    function getPlayerDeck(address user) public view returns(uint256[52] memory) {
        require(msg.sender == casino,"You are not permitted to access this function");
        
        uint256[52] memory returnData = mapPlayerDeck[user];
        
        return returnData;
    }
    
    

    function getPlayerHand(address user) public view returns(uint256[12] memory) {
        require(msg.sender == casino,"You are not permitted to access this function");
        
        uint256[12] memory returnData = mapPlayer_card[user];
        
        return returnData;
    }
    
    
    

    function getCasinoHand(address user) public view returns(uint256[12] memory) {
        require(msg.sender == casino,"You are not permitted to access this function");
        
        uint256[12] memory returnData = mapCasino_card[user];
        
        return returnData;
    }
  
    //This is phase 1
    function initializeGame() external payable {
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
        //clear up the card value
        
        bool found = false;
        for (uint i = 0; i < addressKeys.length; i++){
            if (addressKeys[i] == msg.sender){
                found = true;
                break;
            }
        }
        
        if (!found){
            addressKeys.push(msg.sender);
        }
        
        for (uint256 i = 0; i < 12; i ++){
            mapPlayer_card[msg.sender][i] = 100;
            mapCasino_card[msg.sender][i] = 100;
        }
        mapPlayerDeckindex[msg.sender] = 0;
        mapPlayer_card_num[msg.sender] = 0;
        mapCasino_card_num[msg.sender] = 0;
        mapGamestate[msg.sender] = GameState.Deck_shuffle;
        mapBet[msg.sender] = msg.value;
        mapGameResult[msg.sender] = GameResult.InProgress;
        payable(address(this)).transfer(mapBet[msg.sender]);
    }     
    
    
    //This is phase 2
    //pass the card to the mapPlayerDeck
    function Casino_get_deck(address user, uint256[52] calldata shuffledCards) external{
         require(
            msg.sender == casino,
            "Only casino can call this function"
        );
        require(
            mapGamestate[user] == GameState.Deck_shuffle,
            "Play needs to initilize the game"
            );
        mapGamestate[user] = GameState.Car_Distribution;
        mapPlayerDeck[user] = shuffledCards;
    }
    
    // Phase 3: Distribute cards
    function distribute(address user) external{
        require(msg.sender == casino, "Only the casino may call this function."
        );
        require(mapGamestate[user] == GameState.Car_Distribution, "This is not the proper phase to distribute cards.");
        
        mapCasino_card[user][mapCasino_card_num[user]] = mapPlayerDeck[user][mapPlayerDeckindex[user]];
        mapCasino_card_num[user] += 1;
        mapPlayerDeckindex[user] += 1;
        mapCasino_card[user][mapCasino_card_num[user]] = mapPlayerDeck[user][mapPlayerDeckindex[user]];
        mapCasino_card_num[user] += 1;
        mapPlayerDeckindex[user] += 1;
        mapPlayer_card[user][mapPlayer_card_num[user]] = mapPlayerDeck[user][mapPlayerDeckindex[user]];
        mapPlayer_card_num[user] += 1;
        mapPlayerDeckindex[user] += 1;
        mapPlayer_card[user][mapPlayer_card_num[user]] = mapPlayerDeck[user][mapPlayerDeckindex[user]];
        mapPlayer_card_num[user] += 1;
        mapPlayerDeckindex[user] += 1;
        
        
        mapGamestate[user] = GameState.Player_Turn;
        
    }




    
    receive() external payable {
        require(msg.data.length == 0);
    }
     function getBetByKey(address _user) public view returns (uint256) {
        return mapBet[_user];
    }
    
}
