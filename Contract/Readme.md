**pragma solidity 0.6.6** - specify the version.

**contract BlackJack** - the name of the contract.

**enum GameState {Inactive, Deck_shuffle, Car_Distribution, Player_Turn, Casino_Turn, Reveal, Clear}** - GameState disallows user or casino process to next state before the previous state is finished. In the Inactive phase, the player needs to call the initializeGame() function to initialize the game. In the Deck_suffle phase, Deck is waiting to be shuffle. In car_Distribution phase, the card is waiting to be distributed. In player_Turn phase, the player can either choose to hit or stand. In casino_Turn phase, the casino keeps hitting until the value of the cards exceeds 17. In Reveal phrase, cheating is determined through hashing scheme and the transaction is made according to the result. In Clear phase, everything is reseted and prepare for the new game.

**enum GameResult {None, InProgress, Won, Lost, Push}** - Enum stores the game result after the game is completed. The game result will be applied to the front end.

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
