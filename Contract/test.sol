pragma solidity 0.6.6;

contract Coinflip {
    mapping(address => uint256[]) public mapInt1;
    mapping(address => uint256[]) public mapInt2;

    constructor() public {}

    function getShuffle1(string calldata rcom, string calldata rP) external {
        uint256[] memory array_Binary1 = new uint256[](156);
        uint256 count1 = 0;
        uint256 count2 = 1;

        while (count2 != 156) {
            if (
                keccak256(bytes(string(rcom[count1:count2]))) ==
                keccak256(bytes(string(rP[count1:count2])))
            ) {
                array_Binary1[count1] = 0;
            } else {
                array_Binary1[count1] = 1;
            }
            count1++;
            count2++;
        }
        mapInt1[msg.sender] = array_Binary1;
    }

    function getShuffle2(string calldata rcom, string calldata rP) external {
        uint256[] memory array_Binary1 = new uint256[](156);
        uint256 count1 = 0;
        uint256 count2 = 1;

        while (count2 != 156) {
            if (
                keccak256(bytes(string(rcom[count1:count2]))) ==
                keccak256(bytes(string(rP[count1:count2])))
            ) {
                array_Binary1[count1] = 0;
            } else {
                array_Binary1[count1] = 1;
            }
            count1++;
            count2++;
        }
        mapInt2[msg.sender] = array_Binary1;
    }

    function CheckPlayerCasinoCard()
        external
        view
        returns (uint256[52] memory)
    {
        uint256 slice_Index = 0;
        uint256 temp1 = 5;
        uint256 num = 0;
        uint256[] memory array_Random = new uint256[](52);

        for (uint256 i = 0; i < 156; i = i + 6) {
            for (uint256 j = i; j < i + 6; j++) {
                num += 2**temp1 * mapInt1[msg.sender][j];
                temp1--;
            }
            array_Random[slice_Index] = num % 52;
            slice_Index += 1;
            temp1 = 5;
            num = 0;
        }

        for (uint256 i = 0; i < 156; i = i + 6) {
            for (uint256 j = i; j < i + 6; j++) {
                num += 2**temp1 * mapInt2[msg.sender][j];
                temp1--;
            }
            array_Random[slice_Index] = num % 52;
            slice_Index += 1;
            temp1 = 5;
            num = 0;
        }

        uint256[52] memory newDeck =
            [
                uint256(0),
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15,
                16,
                17,
                18,
                19,
                20,
                21,
                22,
                23,
                24,
                25,
                26,
                27,
                28,
                29,
                30,
                31,
                32,
                33,
                34,
                35,
                36,
                37,
                38,
                39,
                40,
                41,
                42,
                43,
                44,
                45,
                46,
                47,
                48,
                49,
                50,
                51
            ];

        uint256 count = 0;
        uint256 currentIndex = 52;
        uint256 temporaryValue = 0;
        //shuffle the newDeck with Fisher-Yates Algorithm using the random Index that we got from rFy above
        while (currentIndex != 0) {
            uint256 randomIndex = array_Random[count];
            currentIndex = currentIndex - 1;
            temporaryValue = newDeck[currentIndex];
            newDeck[currentIndex] = newDeck[randomIndex];
            newDeck[randomIndex] = temporaryValue;
            count++;
        }

        return newDeck;
    }
}
