// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PrivilegeCard is ERC721Enumerable, Ownable {
    // Event declarations
    event CardCreated(
        uint256 cardId,
        string name,
        uint256 price,
        uint256 maxSupply,
        uint256 discountRate
    );
    event CardBought(uint256 cardId, address buyer, uint256 totalSupplied);

    struct Card {
        uint256 id;
        uint256 price;
        string name;
        string description;
        uint256 maxSupply;
        uint256 discountRate;
        uint256 totalSupplied;
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
            nextCardId,
            price,
            name,
            description,
            maxSupply,
            discountRate,
            0
        );
        nextCardId++;
        emit CardCreated(nextCardId, name, price, maxSupply, discountRate);
    }

    mapping(uint256 => mapping(address => bool)) public cardPurchases;
    mapping(uint256 => uint256) private _tokenToCardType;

    function buyCard(uint256 cardId) public payable {
        require(msg.value >= cards[cardId].price, "Insufficient funds");
        require(
            !cardPurchases[cardId][msg.sender],
            "Card already bought by this account"
        );
        require(
            cards[cardId].totalSupplied < cards[cardId].maxSupply,
            "Max supply reached"
        );

        // Create a new unique token ID for this card
        uint256 newTokenId = totalSupply() + 1; // Example of generating a new token ID

        _mint(msg.sender, newTokenId);
        _cardSupply[cardId]++;
        cards[cardId].totalSupplied = _cardSupply[cardId];
        cardPurchases[cardId][msg.sender] = true; // Mark as bought for this account

        _tokenToCardType[newTokenId] = cardId; // Track the card type for this token

        emit CardBought(cardId, msg.sender, _cardSupply[cardId]);
    }

    // Add a function to get the card type by token ID
    function getCardType(uint256 tokenId) public view returns (uint256) {
        // This will revert if the token does not exist.
        address owner = ownerOf(tokenId);
        require(owner != address(0), "Token does not exist.");

        return _tokenToCardType[tokenId];
    }

    function getCardDiscountRate(
        uint256 tokenId
    ) public view returns (uint256) {
        Card memory card = cards[tokenId];
        return card.discountRate;
    }

    function getTotalCards() public view returns (uint256) {
        return nextCardId;
    }
}
