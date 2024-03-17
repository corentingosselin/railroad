// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./PrivilegeCard.sol";

contract TicketSystem {
    PrivilegeCard private privilegeCardContract;
    uint256 public constant TICKET_PRICE = 0.01 ether;

    constructor(address privilegeCardAddress) {
        privilegeCardContract = PrivilegeCard(privilegeCardAddress);
    }

    // Function to buy a ticket with an applied discount based on owned Privilege Cards
    function buyTicket() public payable {
        uint256 discount = getMaxDiscount(msg.sender);
        uint256 discountedPrice = TICKET_PRICE -
            ((TICKET_PRICE * discount) / 100);

        require(msg.value >= discountedPrice, "Insufficient funds sent");

        // Process the ticket purchase here
        // For simplicity, we're not actually issuing a ticket in this example

        // Refund any excess payment
        if (msg.value > discountedPrice) {
            payable(msg.sender).transfer(msg.value - discountedPrice);
        }
    }

    function getMaxDiscount(
        address user
    ) internal view returns (uint256 maxDiscount) {
        uint256 balance = privilegeCardContract.balanceOf(user);
        maxDiscount = 0; // Initialize maxDiscount to 0

        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = privilegeCardContract.tokenOfOwnerByIndex(
                user,
                i
            );
            uint256 cardDiscount = privilegeCardContract.getCardDiscountRate(
                tokenId
            );

            if (cardDiscount > maxDiscount) {
                maxDiscount = cardDiscount; 
            }
        }
        return maxDiscount;
    }

    function getMyTickets() public view returns (uint256[] memory) {
        uint256 balance = privilegeCardContract.balanceOf(msg.sender);
        uint256[] memory tickets = new uint256[](balance);

        for (uint256 i = 0; i < balance; i++) {
            tickets[i] = privilegeCardContract.tokenOfOwnerByIndex(msg.sender, i);
        }
        return tickets;
    }
}
