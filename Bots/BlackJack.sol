pragma solidity 0.6.6;

contract BlackJack {
    address public casino;

    //Denotes each phase in the game
    enum GameState {
        Inactive,
        Deck_shuffle,
        Car_Distribution,
        Player_Turn,
        Casino_Turn,
        Reveal
    }

    //Generic description of game result
    enum GameResult {None, InProgress, Won, Lost, Push}

    //Player Hand
    mapping(address => uint256[12]) private mapPlayer_card;
    //Casino Hand
    mapping(address => uint256[12]) private mapCasino_card;

    //Keeps track of index of player and casino hand
    //Useful for knowing where to place card on our size 12 array
    mapping(address => uint256) private mapPlayer_card_num;
    mapping(address => uint256) private mapCasino_card_num;

    //Keeps track of what card is at the "top"
    //of our deck via indexes
    mapping(address => uint256) private mapGameDeckindex;

    //The hash of the game deck per player
    mapping(address => bytes32[52]) public mapCasinoHash;

    //Keeps track of deck for each game per user address
    mapping(address => uint256[52]) private mapGameDeck;

    //Keeps track of bets placed on each game
    mapping(address => uint256) public mapBet;

    mapping(address => uint256) private mapRevealExpiration;
    mapping(address => uint256) private mapPlayerTurnExpiration;

    //Keeps track of game state and result using enumerators above
    mapping(address => GameState) public mapGamestate;
    mapping(address => GameResult) public mapGameResult;

    //Keeps track of how many aces are in each hand
    mapping(address => uint256) private player_AceCount;
    mapping(address => uint256) private casino_AceCount;
    
    //keeps track of hashed rCom
    mapping(address => string) private map_rCom;

    //Keeps a log of all addresses that interacted with this smart contract
    address[] addressKeys;
    uint256 public minBet = 0.001 ether;
    uint256 public expireTime = 1; //ONE MINUTE EXPIRATION

    constructor() public {
        casino = msg.sender;
    }

    //Withdraw money from the smart contract
    //This is dependent on maxbet()
    function withdrawMoney() external {
        require(
            msg.sender == casino,
            "Only the casino may withdraw money into the smart contract"
        );
        payable(msg.sender).transfer(address(this).balance);
    }

    //Deposit money to the smart contract
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

    //FOR BACKEND -  Casino bot
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

    function getPhase5Games() public view returns (address[] memory) {
        require(
            msg.sender == casino,
            "You are not permitted to access this function"
        );

        address[] memory phase5 = new address[](addressKeys.length);

        for (uint256 i = 0; i < addressKeys.length; i++) {
            if (mapGamestate[addressKeys[i]] == GameState.Casino_Turn) {
                phase5[i] = addressKeys[i];
            }
        }

        return phase5;
    }

    function getExpiredReveal() public view returns (address[] memory) {
        require(
            msg.sender == casino,
            "You are not permitted to access this function"
        );

        address[] memory phase5 = new address[](addressKeys.length);

        for (uint256 i = 0; i < addressKeys.length; i++) {
            if (mapGamestate[addressKeys[i]] == GameState.Reveal) {
                if (
                    block.timestamp >
                    mapRevealExpiration[addressKeys[i]] + expireTime
                ) {
                    phase5[i] = addressKeys[i];
                }
            }
        }

        return phase5;
    }

    //END OF BACKEND

    //FOR FRONTEND - React

    //Always reveal the player hand
    function getPlayerHand(address user)
        public
        view
        returns (uint256[12] memory)
    {
        require(
            mapGamestate[msg.sender] != GameState.Inactive,
            "Cannot reveal cards yet!"
        );

        require(
            mapGamestate[msg.sender] != GameState.Deck_shuffle,
            "Cannot reveal cards yet!"
        );

        require(
            mapGamestate[msg.sender] != GameState.Car_Distribution,
            "Cannot reveal cards yet!"
        );
        require(
            msg.sender != casino,
            "You are not permitted to access this function"
        );

        uint256[12] memory returnData = mapPlayer_card[user];

        return returnData;
    }

    //Reveals only the first card of casino hand
    function showCasinoFirstCard() public view returns (uint256) {
        require(
            mapGamestate[msg.sender] == GameState.Player_Turn,
            "Cannot reveal first card yet!"
        );

        return mapCasino_card[msg.sender][0];
    }

    //UI can call this during reveal phase only
    function getCasinoHand() public view returns (uint256[12] memory) {
        require(
            mapGamestate[msg.sender] == GameState.Reveal,
            "Cannot reveal all the cards yet!"
        );

        uint256[12] memory returnData = mapCasino_card[msg.sender];

        return returnData;
    }

    //UI can call this during reveal phase only
    function getGameDeck() public view returns (uint256[52] memory) {
        require(
            mapGamestate[msg.sender] == GameState.Reveal,
            "Cannot reveal all the cards yet!"
        );

        uint256[52] memory returnData = mapGameDeck[msg.sender];

        return returnData;
    }

    //END OF FRONTEND

    //PHASE ONE - INITIALIZE GAME
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
            msg.value <= .1 ether,
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

        for (uint256 i = 0; i < 52; i++) {
            mapGameDeck[msg.sender][i] = 100;
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

    //PHASE TWO - OPEN DECK
    // REVISIT! Need to accommodate for hash
    function Casino_get_deck(
        address user,
        uint256[52] calldata shuffledCards,
        string calldata rCom
    ) external {
        require(msg.sender == casino, "Only casino can call this function");
        require(
            mapGamestate[user] == GameState.Deck_shuffle,
            "Play needs to initilize the game"
        );

        map_rCom[user] = rCom;
        mapGamestate[user] = GameState.Car_Distribution;
        mapGameDeck[user] = shuffledCards; //NOTE: shuffled cards should  come from hash
    }

    //PHASE THREE - DISTRIBUTE CARD
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
        if (Casino_check(user) == 21 && Player_check(user) == 21) {
            mapGamestate[user] = GameState.Reveal;
        } else if (Casino_check(user) == 21) {
            mapGamestate[user] = GameState.Reveal;
        } else if (Player_check(user) == 21) {
            mapGamestate[user] = GameState.Reveal;
        } else {
            mapGamestate[user] = GameState.Player_Turn;
        }
    }

    //PHASE FOUR - PLAYER TURN
    //Two options - hit or stand

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

    //PHASE FIVE - CASINO TURN
    //Casino will continue to hit until stop condition

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
        }
    }

    // this is Phase 5
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

        mapGamestate[Player] = GameState.Reveal;
        mapRevealExpiration[Player] = block.timestamp;
    }

    function CheckPlayerCasinoCard(address player, uint256 secretKey)
        private
        view
        returns (bool)
    {
        uint256[] memory reconstructDeck = new uint256[](52);

        uint256 casinoHandIndex = 0;
        uint256 playerHandIndex = 0;
        uint256 reconstructIndex = 0;

        reconstructDeck[reconstructIndex] = mapCasino_card[player][
            casinoHandIndex
        ];
        reconstructIndex += 1;
        casinoHandIndex += 1;

        reconstructDeck[reconstructIndex] = mapCasino_card[player][
            casinoHandIndex
        ];
        reconstructIndex += 1;
        casinoHandIndex += 1;

        reconstructDeck[reconstructIndex] = mapPlayer_card[player][
            playerHandIndex
        ];
        reconstructIndex += 1;
        playerHandIndex += 1;

        reconstructDeck[reconstructIndex] = mapPlayer_card[player][
            playerHandIndex
        ];
        reconstructIndex += 1;
        playerHandIndex += 1;

        while (mapPlayer_card[player][playerHandIndex] != 100) {
            reconstructDeck[reconstructIndex] = mapPlayer_card[player][
                playerHandIndex
            ];
            reconstructIndex += 1;
            playerHandIndex += 1;
        }

        while (mapCasino_card[player][casinoHandIndex] != 100) {
            reconstructDeck[reconstructIndex] = mapCasino_card[player][
                casinoHandIndex
            ];
            reconstructIndex += 1;
            casinoHandIndex += 1;
        }

        while (reconstructIndex != 52) {
            reconstructDeck[reconstructIndex] = mapGameDeck[player][
                reconstructIndex
            ];
            reconstructIndex += 1;
        }
        bytes32[] memory reconstructDeckHash = new bytes32[](52);

        for (uint256 i = 0; i < 52; i++) {
            reconstructDeckHash[i] = keccak256(
                abi.encodePacked(uint256(secretKey), reconstructDeck[i])
            );
        }

        for (uint256 i = 0; i < 52; i++) {
            if (reconstructDeckHash[i] != mapCasinoHash[player][i]) {
                return false;
            }
        }

        return true;

        // uint256 count = 0;
        // if(mapCasino_card[player][0] != mapGameDeck[player][0] && mapCasino_card[player][1] != mapGameDeck[player][1]){
        //     return false;
        // }
        // if(mapPlayer_card[player][0] != mapGameDeck[player][2] && mapPlayer_card[player][1] != mapGameDeck[player][3]){
        //     return false;
        // }
        // count = 4;
        // for(uint256 i = 2; i < mapPlayer_card_num[player]; i++){
        //     if(mapPlayer_card[player][i] != mapGameDeck[player][count]){
        //         return false;
        //     }
        //     count = count + 1;
        // }
        // for(uint256 j = 2; j < mapCasino_card_num[player]; j++){
        //     if(mapCasino_card[player][j] != mapGameDeck[player][count]){
        //         return false;
        //     }
        //     count = count + 1;
        // }
        // return true;
    }

    // This is phase 6
    function Payout(address player, uint256 secretKey) public {
        require(
            mapGamestate[player] == GameState.Reveal,
            "This user's game is not ready for the reveal phase"
        );
        require(CheckPlayerCasinoCard(player, secretKey), "Cheating Detect!!!");
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

    //check the total card value for player
    function Player_check(address player) private view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < mapPlayer_card_num[player]; i++) {
            if (mapPlayer_card[player][i] % 13 == 0) {
                continue;
            } else if ((mapPlayer_card[player][i] % 13) >= 10) {
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
            } else if ((mapCasino_card[player][i] % 13) >= 10) {
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

    //Smart contract keep the money
    function Casino_Win(address player) private {
        mapGamestate[player] = GameState.Inactive;
        mapGameResult[player] = GameResult.Lost;
        mapBet[player] = 0;
    }

    //Smart contract transfer the money to the player
    function Player_Win(address payable player) private {
        mapGamestate[player] = GameState.Inactive;
        mapGameResult[player] = GameResult.Won;
        payable(player).transfer(mapBet[player] * 2);
        mapBet[player] = 0;
    }

    //Smart contract returns the player's betting
    function Game_Pushed(address payable player) private {
        mapGamestate[player] = GameState.Inactive;
        mapGameResult[player] = GameResult.Push;
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