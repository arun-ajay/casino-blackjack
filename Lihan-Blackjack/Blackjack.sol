pragma solidity 0.6.6;

contract BlackJack {
    address public casino;
    uint256[52] private deck;

    enum GameState {
        Inactive,
        Deck_shuffle,
        Car_Distribution,
        Player_Turn,
        Casino_Turn,
        Reveal
    }
    enum GameResult {None, InProgress, Won, Lost, Push}

    mapping(address => uint256[12]) mapPlayer_card;
    mapping(address => uint256[12]) mapCasino_card;
    //card number user to to input card to mapCasino_card or mapPlayer_card
    mapping(address => uint256) mapPlayer_card_num;
    mapping(address => uint256) mapCasino_card_num;
    mapping(address => uint256) private mapCasinoRandom;
    mapping(address => uint256) public mapCasinoHash;
    mapping(address => uint256) public mapBet;
    mapping(address => uint256[52]) public mapGameDeck;
    mapping(address => uint256) mapGameDeckindex;
    mapping(address => uint256) mapPlayernum;
    mapping(address => GameState) public mapGamestate;
    mapping(address => GameResult) public mapGameResult;
    mapping(address => uint256) public player_AceCount;
    mapping(address => uint256) public casino_AceCount;

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
        require(msg.value >= 1 ether);

        //User gives contract the ETH for bet
        payable(address(this)).transfer(msg.value);
    }

    //Check the maxbet value
    function maxBet() public view returns (uint256) {
        uint256 currentBalance = address(this).balance;

        uint256 boundMoney = 0;

        for (uint256 i = 0; i < addressKeys.length; i++) {
            boundMoney += getBetByKey(addressKeys[i]);
        }

        return currentBalance - 2 * boundMoney;
    }

    //Shuffle the card
    //player can view their current cards

    function getPhase2Games() public view returns (address[] memory) {
        require(
            msg.sender == casino,
            "You are not permitted to access this function"
        );

        address[] memory phase2 = new address[](addressKeys.length);

        for (uint256 i = 0; i < addressKeys.length; i++) {
            if (mapGamestate[addressKeys[i]] == GameState.Deck_shuffle) {
                phase2[i] = addressKeys[i];
            }
        }

        return phase2;
    }

    function getPhase3Games() public view returns (address[] memory) {
        require(
            msg.sender == casino,
            "You are not permitted to access this function"
        );

        address[] memory phase3 = new address[](addressKeys.length);

        for (uint256 i = 0; i < addressKeys.length; i++) {
            if (mapGamestate[addressKeys[i]] == GameState.Car_Distribution) {
                phase3[i] = addressKeys[i];
            }
        }

        return phase3;
    }

    function getGameDeck(address user)
        public
        view
        returns (uint256[52] memory)
    {
        require(
            msg.sender == casino,
            "You are not permitted to access this function"
        );

        uint256[52] memory returnData = mapGameDeck[user];

        return returnData;
    }

    function getPlayerHand(address user)
        public
        view
        returns (uint256[12] memory)
    {
        require(
            msg.sender == casino,
            "You are not permitted to access this function"
        );

        uint256[12] memory returnData = mapPlayer_card[user];

        return returnData;
    }

    function getCasinoHand(address user)
        public
        view
        returns (uint256[12] memory)
    {
        require(
            msg.sender == casino,
            "You are not permitted to access this function"
        );

        uint256[12] memory returnData = mapCasino_card[user];

        return returnData;
    }

    // 3 functions for testing purpose
    function Reveal_player_card() external view returns (uint256[12] memory) {
        return mapPlayer_card[msg.sender];
    }

    function Reveal_casino_card(address player)
        external
        view
        returns (uint256[12] memory)
    {
        return mapCasino_card[player];
    }

    function shuffle(address player) private {
        for (uint256 i = 0; i < 52; i++) {
            mapGameDeck[player][i] = i;
        }
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
        require(
            msg.value >= minBet,
            "You must provide a minimum of 0.001 ether"
        );

        bool found = false;
        for (uint256 i = 0; i < addressKeys.length; i++) {
            if (addressKeys[i] == msg.sender) {
                found = true;
                break;
            }
        }

        if (!found) {
            addressKeys.push(msg.sender);
        }

        for (uint256 i = 0; i < 12; i++) {
            mapPlayer_card[msg.sender][i] = 100;
            mapCasino_card[msg.sender][i] = 100;
        }

        //clear up the card value
        mapGameDeckindex[msg.sender] = 0;
        mapPlayer_card_num[msg.sender] = 0;
        mapCasino_card_num[msg.sender] = 0;
        player_AceCount[msg.sender] = 0;
        casino_AceCount[msg.sender] = 0;

        mapGamestate[msg.sender] = GameState.Deck_shuffle;
        mapBet[msg.sender] = msg.value;
        mapGameResult[msg.sender] = GameResult.InProgress;
        payable(address(this)).transfer(mapBet[msg.sender]);
    }

    //This is phase 2
    //pass the card to the mapGameDeck
    // function Casino_get_deck(address user, uint256[52] calldata shuffledCards)
    //     external
    // {
    //     require(msg.sender == casino, "Only casino can call this function");
    //     require(
    //         mapGamestate[user] == GameState.Deck_shuffle,
    //         "Play needs to initilize the game"
    //     );
    //     mapGamestate[user] = GameState.Car_Distribution;
    //     mapGameDeck[user] = shuffledCards;
    // }

    function Casino_get_deck(address user) external {
        require(msg.sender == casino, "Only casino can call this function");
        require(
            mapGamestate[user] == GameState.Deck_shuffle,
            "Play needs to initilize the game"
        );
        shuffle(user);
        mapGamestate[user] = GameState.Car_Distribution;
        // mapGameDeck[user] = shuffledCards;
    }

    // Phase 3: Distribute cards
    function distribute(address user) external {
        require(
            msg.sender == casino,
            "Only the casino may call this function."
        );
        require(
            mapGamestate[user] == GameState.Car_Distribution,
            "This is not the proper phase to distribute cards."
        );

        mapCasino_card[user][mapCasino_card_num[user]] = mapGameDeck[user][
            mapGameDeckindex[user]
        ];
        // if loop to keep track of number of Aces
        if (mapCasino_card[user][mapCasino_card_num[user]] % 13 == 0) {
            casino_AceCount[user]++;
        }
        mapCasino_card_num[user] += 1;
        mapGameDeckindex[user] += 1;
        mapCasino_card[user][mapCasino_card_num[user]] = mapGameDeck[user][
            mapGameDeckindex[user]
        ];
        if (mapCasino_card[user][mapCasino_card_num[user]] % 13 == 0) {
            casino_AceCount[user]++;
        }
        mapCasino_card_num[user] += 1;
        mapGameDeckindex[user] += 1;
        mapPlayer_card[user][mapPlayer_card_num[user]] = mapGameDeck[user][
            mapGameDeckindex[user]
        ];
        if (mapPlayer_card[user][mapPlayer_card_num[user]] % 13 == 0) {
            player_AceCount[user]++;
        }
        mapPlayer_card_num[user] += 1;
        mapGameDeckindex[user] += 1;
        mapPlayer_card[user][mapPlayer_card_num[user]] = mapGameDeck[user][
            mapGameDeckindex[user]
        ];
        if (mapPlayer_card[user][mapPlayer_card_num[user]] % 13 == 0) {
            player_AceCount[user]++;
        }
        mapPlayer_card_num[user] += 1;
        mapGameDeckindex[user] += 1;

        //check if game already meet winning condition after inital card distrubution
        if(Casino_check(user) == 21 && Player_check(user) == 21){
          mapGamestate[user] = GameState.Reveal;
          mapGameResult[user] = GameResult.Push;
        }
        else if(Casino_check(user) == 21){
          mapGamestate[user] = GameState.Reveal;
          mapGameResult[user] = GameResult.Lost;
        }
        else if(Player_check(user) == 21){
          mapGamestate[user] = GameState.Reveal;
          mapGameResult[user] = GameResult.Won;
        }
        else {
          mapGamestate[user] = GameState.Player_Turn;
        }
    }
    
    // Player Hit & Stand make up Phase 5
    // player draws a card
    // player only function
    function Player_Hit() external {
        require(msg.sender != casino, "Only player can call this function");
        require(
            mapGamestate[msg.sender] == GameState.Player_Turn,
            "Casino has not distribute the card yet"
        );
        uint256 deck_index = mapGameDeckindex[msg.sender];
        uint256 player_index = mapPlayer_card_num[msg.sender];
        mapPlayer_card[msg.sender][player_index] = mapGameDeck[msg.sender][
            deck_index
        ];
        if (
            mapPlayer_card[msg.sender][mapPlayer_card_num[msg.sender]] % 13 == 0
        ) {
            player_AceCount[msg.sender]++;
        }
        mapGameDeckindex[msg.sender] += 1;
        mapPlayer_card_num[msg.sender] += 1;

        if (Player_check(msg.sender) > 21) {
            mapGamestate[msg.sender] = GameState.Reveal;
            Reveal(msg.sender);
        }
    }

    // Only for player
    function Stand() external {
        require(msg.sender != casino, "Only player can call this function");
        require(
            mapGamestate[msg.sender] == GameState.Player_Turn,
            "Casino has not distribute the card yet"
        );
        mapGamestate[msg.sender] = GameState.Casino_Turn;
    }

    // casino draws a card
    // casino only function
    function Casino_Hit(address player) private {
        require(
            mapGamestate[player] == GameState.Casino_Turn,
            "Player has not finish yet"
        );
        uint256 deck_index = mapGameDeckindex[player];
        uint256 casino_index = mapCasino_card_num[player];
        mapCasino_card[player][casino_index] = mapGameDeck[player][deck_index];
        if (mapCasino_card[player][mapCasino_card_num[player]] % 13 == 0) {
            casino_AceCount[player]++;
        }
        mapGameDeckindex[player] += 1;
        mapCasino_card_num[player] += 1;

        if (Casino_check(player) > 21) {
            mapGamestate[player] = GameState.Reveal;
            Reveal(player);
        }
    }

    // this is Phase 6
    function Casino_Turn(address Player) external {
        require(
            msg.sender == casino,
            "This function is only for casinos to use."
        );
        require(
            mapGamestate[Player] == GameState.Casino_Turn,
            "It is not the Casino's turn now"
        );

        while (Casino_check(Player) < 17) {
            Casino_Hit(Player);
        }

        if (Casino_check(Player) >= 17) {
            mapGamestate[Player] = GameState.Reveal;
        }
    }

    //check the total card value for player
    function Player_check(address player) private view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < mapPlayer_card_num[player]; i++) {
            if (mapPlayer_card[player][i] % 13 == 0) {
                continue;
            } else if ((mapPlayer_card[player][i] % 13) > 10) {
                total += 10;
            } else {
                total += ((mapPlayer_card[player][i] % 13) + 1);
            }
        }

        if (player_AceCount[player] == 1) {
            if (total + 11 > 21) {
                total = total + 1;
            } else {
                total = total + 11;
            }
        } else if (player_AceCount[player] == 2) {
            if (total + 12 > 21) {
                total = total + 2;
            } else {
                total = total + 12;
            }
        } else if (player_AceCount[player] == 3) {
            if (total + 13 > 21) {
                total = total + 3;
            } else {
                total = total + 13;
            }
        } else if (player_AceCount[player] == 4) {
            if (total + 14 > 21) {
                total = total + 4;
            } else {
                total = total + 14;
            }
        }

        return total;
    }

    //check the total card value for casino
    function Casino_check(address player) private view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < mapCasino_card_num[player]; i++) {
            if (mapCasino_card[player][i] % 13 == 0) {
                continue;
            } else if ((mapCasino_card[player][i] % 13) > 10) {
                total += 10;
            } else {
                total += ((mapCasino_card[player][i] % 13) + 1);
            }
        }

        if (casino_AceCount[player] == 1) {
            if (total + 11 > 21) {
                total = total + 1;
            } else {
                total = total + 11;
            }
        } else if (casino_AceCount[player] == 2) {
            if (total + 12 > 21) {
                total = total + 2;
            } else {
                total = total + 12;
            }
        } else if (casino_AceCount[player] == 3) {
            if (total + 13 > 21) {
                total = total + 3;
            } else {
                total = total + 13;
            }
        } else if (casino_AceCount[player] == 4) {
            if (total + 14 > 21) {
                total = total + 4;
            } else {
                total = total + 14;
            }
        }
        return total;
    }

    //Winning Logic
    function compare(address player) private view returns (string memory) {
        uint256 player_total = 0;
        uint256 casino_total = 0;
        player_total = Player_check(player);
        casino_total = Casino_check(player);

        //determine game result
        if (player_total == casino_total) {
            return "push";
        } else if (casino_total == 21) {
            return "lost";
        } else if (player_total == 21) {
            return "won";
        } else if (player_total > 21) {
            return "lost";
        } else if (casino_total > 21) {
            return "won";
        } else if (player_total > casino_total) {
            return "won";
        } else {
            return "lost";
        }
    }

    //print the outcome
    function Reveal(address player) public {
        require(
            mapGamestate[player] == GameState.Reveal,
            "This user's game is not ready for the reveal phase"
        );
        string memory won = "won";
        string memory lost = "lost";
        string memory push = "push";
        if (
            keccak256(abi.encodePacked(compare(player))) ==
            keccak256(abi.encodePacked(won))
        ) {
            Player_Win(payable(player));
        } else if (
            keccak256(abi.encodePacked(compare(player))) ==
            keccak256(abi.encodePacked(lost))
        ) {
            Casino_Win(player);
        } else if (
            keccak256(abi.encodePacked(compare(player))) ==
            keccak256(abi.encodePacked(push))
        ) {
            Game_Pushed(payable(player));
        }
    }

    //Smart contract keep the money
    function Casino_Win(address player) private {
        mapGamestate[player] = GameState.Inactive;
        mapGameResult[player] = GameResult.Push;
        mapBet[player] = 0;
    }

    //Smart contract transfer the money to the casino
    function Player_Win(address payable player) private {
        mapGamestate[player] = GameState.Inactive;
        mapGameResult[player] = GameResult.Won;
        payable(player).transfer(mapBet[player] * 2);
        mapBet[player] = 0;
    }

    //Smart contract returns the player's betting
    function Game_Pushed(address payable player) private {
        mapGamestate[player] = GameState.Inactive;
        mapGameResult[player] = GameResult.Won;
        payable(player).transfer(mapBet[player]);
        mapBet[player] = 0;
    }

    receive() external payable {
        require(msg.data.length == 0);
    }

    function getBetByKey(address _user) public view returns (uint256) {
        return mapBet[_user];
    }
}
