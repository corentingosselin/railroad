// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./PrivilegeCard.sol";
import "hardhat/console.sol";

contract TicketSystem {
    PrivilegeCard private privilegeCardContract;
    uint256 public constant TICKET_PRICE = 0.01 ether;
    uint256 public nextTicketId;

    struct Ticket {
        uint256 id;
        uint256 pricePaid;
        uint256 discountApplied;
    }

    mapping(address => Ticket[]) public ticketsOwnedByUser;

    event TicketBought(address buyer, uint256 amountPaid, uint256 discountApplied);

    constructor(address privilegeCardAddress) {
        privilegeCardContract = PrivilegeCard(privilegeCardAddress);
    }

    function buyTicket() public payable {
        uint256 discount = getMaxDiscount(msg.sender);
        uint256 discountedPrice = TICKET_PRICE - ((TICKET_PRICE * discount) / 100);
        
        require(msg.value >= discountedPrice, "Insufficient funds sent");

        Ticket memory newTicket = Ticket(nextTicketId, msg.value, discount);
        ticketsOwnedByUser[msg.sender].push(newTicket);

        emit TicketBought(msg.sender, msg.value, discount);
        nextTicketId++;

        if (msg.value > discountedPrice) {
            payable(msg.sender).transfer(msg.value - discountedPrice);
        }
    }

    function getMaxDiscount(address user) internal view returns (uint256 maxDiscount) {
        uint256 balance = privilegeCardContract.balanceOf(user);
        maxDiscount = 0;

        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = privilegeCardContract.tokenOfOwnerByIndex(user, i);
            uint256 cardDiscount = privilegeCardContract.getCardDiscountRate(tokenId);

            if (cardDiscount > maxDiscount) {
                maxDiscount = cardDiscount;
            }
        }
        return maxDiscount;
    }

    function getMyTickets() public view returns (Ticket[] memory) {
        return ticketsOwnedByUser[msg.sender];
    }
}
