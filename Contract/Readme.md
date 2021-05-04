**pragma solidity 0.6.6** - specify the version.
**contract BlackJack** - the name of the contract.
**enum GameState {Inactive, Deck_shuffle, Car_Distribution, Player_Turn, Casino_Turn, Reveal, Clear}** - GameState disallows user or casino process to next state before the previous state is finished. In Inactive phase, player needs to call the initializeGame() function to intialize the game. In Deck_suffle phase, Deck is waiting to be shuffle. In car_Distribution phase, card is waiting to be distribute. In player_Turn phase, player can either choose to hit or stand. In casino_Turn phase, casino keep hitting until the value of the cards exceeds 17. In Reveal phrase, cheating is determined through hashing scheme and the transaction is made according to the result. In Clear phase, everything is reseted and purpare for the new game.
**enum GameResult {None, InProgress, Won, Lost, Push}** - Enum stores the game result after the game is completed. Game result will be applied to the front end.
**mapping(address => uint256[12]) private mapPlayer_card** - Mapping between the player's account address and the player's cards. The maximun number of the card will be 12 because holding more than 12 card will cause total value to exceed 24.
**mapping(address => uint256[12]) private mapCasino_card** - Mapping betweeen casino's account address and casino's cards.
**mapping(address => uint256[52]) private mapShuffled_Deck** - Mapping between the player's account address and deck with 52 cards. The shuffle deck creates by the FisherYatesShuffle function. Use to compare with recontructed deck for cheating detection. 
**mapping(address => uint256) private mapPlayer_card_num** - Mapping between the player's account address 

