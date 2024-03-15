// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PrivilegeCard is ERC721Enumerable, Ownable {
    struct Card {
        uint256 price;
        string name;
        string description;
        uint256 maxSupply;
        uint256 discountRate;
    }
    mapping(uint256 => Card) public cards;
    mapping(uint256 => uint256) private _cardSupply;

    uint256 public nextCardId;

    constructor(
        address initialOwner
    ) ERC721("SupRailRoad Privilege Card", "SRPC") Ownable(initialOwner) {}

    function createCard(
        string memory name,
        string memory description,
        uint256 price,
        uint256 maxSupply,
        uint256 discountRate
    ) public onlyOwner {
        cards[nextCardId] = Card(
            price,
            name,
            description,
            maxSupply,
            discountRate
        );
        nextCardId++;
    }

    function buyCard(uint256 cardId) public payable {
        require(msg.value >= cards[cardId].price, "Insufficient funds");
        require(
            _cardSupply[cardId] < cards[cardId].maxSupply,
            "Max supply reached"
        );
        _mint(msg.sender, cardId);
        _cardSupply[cardId]++;
    }

    function getCardDiscountRate(
        uint256 tokenId
    ) public view returns (uint256) {
        Card memory card = cards[tokenId];
        return card.discountRate;
    }
}
