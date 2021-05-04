**pragma solidity 0.6.6** - specify the version.

**contract BlackJack** - the name of the contract.

**enum GameState {Inactive, Deck_shuffle, Car_Distribution, Player_Turn, Casino_Turn, Reveal, Clear}** - GameState disallows user or casino process to next state before the previous state is finished. In the Inactive phase, the player needs to call the initializeGame() function to initialize the game. In the Deck_suffle phase, Deck is waiting to be shuffle. In car_Distribution phase, the card is waiting to be distributed. In player_Turn phase, the player can either choose to hit or stand. In casino_Turn phase, the casino keeps hitting until the value of the cards exceeds 17. In Reveal phrase, cheating is determined through hashing scheme and the transaction is made according to the result. In Clear phase, everything is reseted and prepare for the new game.

**enum GameResult {None, InProgress, Won, Lost, Push}** - Enum stores the game result after the check_winning function is called. The game result will be applied to the front end.

**mapping(address => uint256[12]) private mapPlayer_card** - Mapping between the player's account address and the player's cards. The maximum number of the card will be 12 because holding more than 12 cards will cause the total value to exceed 24.

**mapping(address => uint256[12]) private mapCasino_card** - Mapping betweeen casino's account address and casino's cards.

**mapping(address => uint256[52]) private mapShuffled_Deck** - Mapping between the player's account address and deck with 52 cards. The shuffling deck creates by the FisherYatesShuffle function. Use to compare with reconstructed deck for cheating detection. 

**mapping(address => uint256) private mapPlayer_card_num** - Mapping between the player's account address and the number of cards of player.

**mapping(address => uint256) private mapCasino_card_num** - Mapping between the casino's account address and the number of cards of the casino.

**mapping(address => uint256) private mapGameDeckindex** - Mapping between the player's account address and the popping index of the deck.

**mapping(address => uint256[52]) private mapGameDeck** - Mapping between the player's account address and the deck.

**mapping(address => uint256[52]) private mapReconstructedDeck** - Mapping between the player's account address and the reconstructed deck. The reconstructed will be used to compare to the shuffled deck for the cheating detection.

**mapping(address => uint256) public mapBet** - Mapping between player's account address and the amount of money that player bets.

**mapping(address => uint256) private mapRevealExpiration** - Mapping between player's account address and the time before the reveal phase. Use to check time expiration.

**mapping(address => GameState) public mapGamestate** - Mapping between player's account address and the game state. Use to check the game phase according to the player's account address.

**mapping(address => GameResult) public mapGameResult** - Mapping between player's account address and the game result.

**mapping(address => uint256) private player_AceCount** - Mapping between player's account address and the number of the ace in the player's cards.

**mapping(address => uint256) private casino_AceCount** Mapping between casino's account address and the number of the ace in the casino's cards.

**mapping(address => bytes32) public map_rCom1_hash** - Mapping between player's account address and the hash of the first half of the rcom (312 bit binary number from the casino). Use for cheating detection.

**mapping(address => bytes32) public map_rCom2_hash** - Mapping between player's account address and the hash of the second half of the rcom (312 bit binary number from the casino). Use for cheating detection.

**mapping(address => uint256[156]) private mapInt1** - Mapping between player's account address and the xor operation between the first half of rcom and the first half of rp (312 bit binary number from the player). Use for cheating detection.

**mapping(address => uint256[156]) private mapInt2** - Mapping between player's account address and the xor operation between the second half of rcom and second half of rp (312 bit binary number from the player). Use for cheating detection.

**address[] addressKeys** - An array that store the addresses of users.

**uint256 public minBet = 0.001 ether** - the minimum betting amount.

**uint256 public expireTime = 1** - The amount of time before the game is automatically resolved.

**constructor() public** - Set the casino's account address to the person who deploys the contract.

**function withdrawMoney() external** - Can only call by the casino. When the withdrawMoney function is called, the casino will withdraw all the
free ether(money that has not use to bet against users) from the smart contract. 

**function depositMoney() external payable** - Can only call by the casino. When the depositMoney function is called, the casino will require to deposit at least 10 ether to the smart contract.

**function maxBet() public view returns (uint256)** - Return the amount of free money in the smart contract that can be used to bet against the player. This 
the function provides important information that prevents the player from betting the amount of ether that exceeds the amount of ether in the smart contract.

**function getPhase2Games() public view returns (address[] memory)** - Only the casino can call this function. This function can access all the players's addresses through addressKeys globe variable. The function will return an array of address that store the player's account address that reaches the Deck_shuffle phase. 

**function getPhase3Games() public view returns (address[] memory)** - Only the casino can call this function. This function can access all the players's addresses through addressKeys globe variable. The function will return an array of address that store the player's account address that reaches the Car_Distribution phase.

**function getPhase5Games() public view returns (address[] memory)** - Only the casino can call this function. This function can access all the players's addresses through addressKeys globe variable. The function will return an array of address that store the player's account address that reaches the Casino_Turn phase.

**function getExpiredReveal() public view returns (address[] memory)** - Only the casino can call this function. This function returns the an array of player's address that exceeds the expired time of the game in the reveal phase. This can prevent player maliciously holds the game. 

**function check_winning(address player) public** - This function can only be called in the reveal phase. The function takes an player's account address as the arugment. This function will set mapGameResult to Won if player wins the game, Lost if player loses the game, Push if the game is tie.

**function getPlayerHand(address user)public view returns (uint256[12] memory)** - This function can only call by player and after car_Distribution phase. It is a getting funciton that returns player's cards.

**function showCasinoFirstCard() public view returns (uint256)** - This function can only be called in player_Turn phase. It returns the first card of the casino's hand.

**function getCasinoHand() public view returns (uint256[12] memory)** - This function can only be called in the Reveal phase. It returns the casino's cards.

**function getGameDeck() public view returns (uint256[52] memory)** - This function can only be called in the Reveal phase. It returns the game deck.

**function initializeGame() external payable** - Precondition: cannot call by casino, game state must be inactive, max bet must not exceed the amount of ether in the smart contract, max bet must not exceed 0.1 ether, minimum bet must greater than the minbet. This function initialize the  mapGameDeckindex,  mapPlayer_card_num, mapCasino_card_num, player_AceCount, casino_AceCount to 0 and set the mapbet to the amount of the either that player bet. Then set mapGamestate to GameState.Deck_shuffle.









