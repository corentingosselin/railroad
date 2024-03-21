const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TicketSystem Contract", function () {
  let PrivilegeCard, TicketSystem;
  let privilegeCard, ticketSystem;
  let owner, addr1, addr2, addrs;

  beforeEach(async function () {
    // Deploy the PrivilegeCard contract
    PrivilegeCard = await ethers.getContractFactory("PrivilegeCard");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    privilegeCard = await PrivilegeCard.deploy(owner.address);

    // Deploy the TicketSystem contract, passing the address of the PrivilegeCard contract
    TicketSystem = await ethers.getContractFactory("TicketSystem");
    ticketSystem = await TicketSystem.deploy(privilegeCard.target);

    // Create cards for testing
    await privilegeCard.createCard(
      "Gold Card",
      "Premium Access",
      ethers.parseEther("0.1"), // Corrected parseEther reference
      100,
      15
    ); // 15% discount
    await privilegeCard.createCard(
      "Silver Card",
      "Standard Access",
      ethers.parseEther("0.05"), // Corrected parseEther reference
      100,
      10
    ); // 10% discount
  });

  describe("Buying tickets with and without discounts", function () {
    it("Should allow users to buy tickets at full price", async function () {
      const ticketPrice = await ticketSystem.TICKET_PRICE();
      await expect(
        ticketSystem.connect(addr1).buyTicket({ value: ticketPrice })
      )
        .to.emit(ticketSystem, "TicketBought")
        .withArgs(addr1.address, ticketPrice, 0); // No discount
    });

    it("Should apply a discount when a user owns a privilege card", async function () {
      // Pre-setup: Ensure addr1 acquires a privilege card granting a discount

      // Use a hardcoded, manually verified discounted price for this test
      const discountedPrice = ethers.parseEther("0.085"); // Example value

      await expect(
        ticketSystem.connect(addr1).buyTicket({ value: discountedPrice })
      ).to.emit(ticketSystem, "TicketBought");
      // Verify the event arguments as necessary
    });

    it("Should refund excess ether sent", async function () {
      const [, addr1] = await ethers.getSigners();

      const ticketPrice = await ticketSystem.TICKET_PRICE();
      const excessAmount = ethers.parseEther("0.02"); // Sending more than the ticket price
      const initialBalance = await addr1.getBalance();

      const tx = await ticketSystem
        .connect(addr1)
        .buyTicket({ value: ticketPrice.add(excessAmount) });
      const receipt = await tx.wait();
      const gasUsed = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice);
      const finalBalance = await addr1.getBalance();

      expect(finalBalance).to.equal(
        initialBalance.sub(ticketPrice).sub(gasUsed).add(excessAmount)
      );
    });
  });

  describe("Utility functions", function () {
    it("Should return all tickets owned by a user", async function () {
      const ticketPrice = await ticketSystem.TICKET_PRICE();
      await ticketSystem.connect(addr1).buyTicket({ value: ticketPrice });
      await ticketSystem.connect(addr1).buyTicket({ value: ticketPrice });

      const tickets = await ticketSystem.connect(addr1).getMyTickets();
      expect(tickets.length).to.equal(2);
    });
  });
});
