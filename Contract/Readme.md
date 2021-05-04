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
free ether(money that has not to use to bet against users) from the smart contract. 

**function depositMoney() external payable** - Can only call by the casino. When the deposit money function is called, the casino will require to deposit at least 10 ether to the smart contract.

**function maxBet() public view returns (uint256)** - Return the amount of free money in the smart contract that can be used to bet against the player. This 
the function provides important information that prevents the player from betting the amount of ether that exceeds the amount of ether in the smart contract.

**function getPhase2Games() public view returns (address[] memory)** - Only the casino can call this function. This function can access all the players' addresses through the addressKeys globe variable. The function will return an array of addresses that store the player's account address that reaches the Deck_shuffle phase. 

**function getPhase3Games() public view returns (address[] memory)** - Only the casino can call this function. This function can access all the players' addresses through addressKeys globe variable. The function will return an array of addresses that store the player's account address that reaches the Car_Distribution phase.

**function getPhase5Games() public view returns (address[] memory)** - Only the casino can call this function. This function can access all the players' addresses through addressKeys globe variable. The function will return an array of addresses that store the player's account address that reaches the Casino_Turn phase.

**function getExpiredReveal() public view returns (address[] memory)** - Only the casino can call this function. This function returns an array of player's addresses that exceeds the expired time of the game in the reveal phase. This can prevent players from maliciously holds the game. 

**function check_winning(address player) public** - This function can only be called in the reveal phase. The function takes a player's account address as the argument. This function will set mapGameResult to Won if the player wins the game, Lost if the player loses the game, Push if the game is a tie.

**function getPlayerHand(address user)public view returns (uint256[12] memory)** - This function can only call by player and after car_Distribution phase. It is a getting function that returns player's cards.

**function showCasinoFirstCard() public view returns (uint256)** - This function can only be called in player_Turn phase. It returns the first card of the casino's hand.

**function getCasinoHand() public view returns (uint256[12] memory)** - This function can only be called in the Reveal phase. It returns the casino's cards.

**function getGameDeck() public view returns (uint256[52] memory)** - This function can only be called in the Reveal phase. It returns the game deck.

**function initializeGame() external payable** - Precondition: cannot call by the casino, the game state must be inactive, the max bet must not exceed the amount of ether in the smart contract, the max bet must not exceed 0.1 ether, the minimum bet must greater than the min bet. Postcondition: This function initialize the mapGameDeckindex,  mapPlayer_card_num, mapCasino_card_num, player_AceCount, casino_AceCount to 0 and set the mapbet to the amount of either that player bet. Then set mapGamestate to GameState.Deck_shuffle and mapGameResult to inprogress.

**function Casino_get_deck(address user, uint256[52] calldata shuffledCards, bytes32  hashed_rCom1, bytes32 hashed_rCom2) external** - This function can only call by casino. It takes user(player's account address), shuffleCard(an array of cards that pass from backend), hashed_rcom1 (hash of first 156 bit of rcom), hashed_rcom2 (hash of second 156 bit of rcom) as arguments. This function stores the argument shuffle card, hashed_rcom1, hash_rcom2 into globe variable with the user as key.

**function distribute(address user) external** - This function can only call by the casino and in the game phase of Car_Distribution. This function distributes two cards from the game deck to the casino. Then the function distributes another two cards from the game deck to the player. It also stores the number of the ace in player_AceCount. The function directly jumps to the reveal phrase if the total value of player's cards reaches 21 or the total value of casino's cards reaches 21 or both total value of player and casino reach 21. Else, the game state is set to Player_Turn.

**function Player_Hit(address player) external** - This function cannot call by the casino and can only be called in player_Turn phase. This function adds a card to the player's hand and update the deck index (deck index determines which card to be pop). When the total value of the player's cards above 21 (bust), the game state will set to reveal phase.

**function Stand() external** - This function cannot call by the casino and can only be called in the player_Turn phase. This function set game state to Casino_Turn.

**function Casino_Hit(address player) private** - This function can only be called in casino_turn phase. Since it is private, it cannot call by player. This function adds one card to the casino's hand.

**function Casino_Turn(address Player) external** - This function can only call by the casino and can only be called in casino_turn. It repeatedly calls casino_hit function until the total value of the casino's cards greater or equal to 17. The game state will be set into the Reveal phase after this function call.

**function FisherYatesShuffle(address player) external** - This function takes the rfy(xor of rcom and rp) and generates an array of random numbers in size 52. Then, the function creates a new deck and use the 52 random numbers to perform Fisher-Yates shuffling algorithm on he new deck. 

**function CheckPlayerCasinoCard(address player) private returns (bool)** - This function reconstructs the used deck with casino's cards and player's cards and compares the reconstructed deck with the shuffled deck returned by the FisherYatesShuffle function above to make sure the game deck has the same order as the shuffled deck. If both decks have the same order, that means the deck wasn't tampered & we can proceed with the Payout phase, otherwise, cheating is detected. 

**function getShuffle1(address player, string calldata rCom1, string calldata rP1) external returns (uint256[] memory)** - This function can only be called in reveal phase and hash(rCom1) must equal to map_rCom1_hash. This function will perform XOR operation between rCom1 and rP1 to produce rFy1 that will be used to produced 26 random index for Fisher-Yates shuffling algorithm.

**function getShuffle2(address player, string calldata rCom2, string calldata rP2) external returns (uint256[] memory)** - This function can only be called in reveal phase and hash(rCom2) must equal to map_rCom2_hash. This function will perform XOR operation between rCom2 and rP2 to produce rFy2 that will be used to produced 26 random index for Fisher-Yates shuffling algorithm.

**function Payout(address player) external** - This function can only be called in the reveal phase. The cheating will be check with a commitment scheme. If the newly generated deck is the same as the game deck that was used in game play, we can proceed with this function. Else, the cheating is detected and we will not execute this function and no payout will be given. These functions will either call Player_Win or Casino_Win or Game_Pushed based on the result generated by compare function below which returns the game result as a string value.

**function Clear(address player) external** - This function can only call by the casino and can only be called in the clear phase. It sets the game state to inactive.

**function getPhase7Games() public view returns (address[] memory)** - This function can only call by casino. It returns all the player's account address that reaches the Clear phase.

**function Player_check(address player) private view returns (uint256)** - Return the total value of player's cards with player's account address as argument.

**function Casino_check(address player) private view returns (uint256)** - Return the total value of casino's cards with player's account address as argument (each player has corresponding casino's cards through mapping).

**function compare(address player) private view returns (string memory)** This function calls Player_check & Casino_check functions to get the total value of player's & casino's cards. Based on those values, determine game result and return the result as string. 

**function Casino_Win(address player) private** This function is executed by the Payout function if the casino won the game, the money will be stored in the smart contract and casino can withdraw it.

**function Player_Win(address payable player) private** This function is executed by the Payout function if the player won the game, the player will receive his original bet * 2.

**function Game_Pushed(address payable player) private** This function is executed by the Payout function if the casino and player has a draw (total values are the same), the player will get his original bet back & casino will not need to do anything. 

**function getBetByKey(address user) private view returns (uint256)** This function will return the bet that's placed by a particular user. 









