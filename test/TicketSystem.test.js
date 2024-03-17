
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivilegeCard and TicketSystem", function () {
  let deployer, user, otherUser;
  let privilegeCard, ticketSystem;
  const ticketPrice = ethers.utils.parseEther("1");

  beforeEach(async function () {
    [deployer, user, otherUser] = await ethers.getSigners();

    // Deploy PrivilegeCard
    const PrivilegeCard = await ethers.getContractFactory("PrivilegeCard");
    privilegeCard = await PrivilegeCard.deploy(deployer.address);
    await privilegeCard.deployed();

    // Deploy TicketSystem with the address of the deployed PrivilegeCard
    const TicketSystem = await ethers.getContractFactory("TicketSystem");
    ticketSystem = await TicketSystem.deploy(privilegeCard.address);
    await ticketSystem.deployed();
  });

  describe("PrivilegeCard", function () {
    it("should allow the owner to create a card", async function () {
      await privilegeCard.createCard("Gold", "Gold card description", ethers.utils.parseEther("0.1"), 100, 10);
      expect(await privilegeCard.nextCardId()).to.equal(1);
    });

    it("should allow users to buy a card", async function () {
      await privilegeCard.createCard("Gold", "Gold card description", ethers.utils.parseEther("0.1"), 100, 10);
      await privilegeCard.connect(user).buyCard(0, { value: ethers.utils.parseEther("0.1") });
      expect(await privilegeCard.balanceOf(user.address)).to.equal(1);
    });
  });

  describe("TicketSystem", function () {
    beforeEach(async function () {
      // Assume a card is already created in the PrivilegeCard contract for these tests
      await privilegeCard.createCard("Gold", "Gold card description", ethers.utils.parseEther("0.1"), 100, 10);
      await privilegeCard.connect(user).buyCard(0, { value: ethers.utils.parseEther("0.1") });
    });

    it("should allow users to buy a ticket at full price with no cards", async function () {
      await expect(ticketSystem.connect(otherUser).buyTicket({ value: ticketPrice }))
        .to.changeEtherBalances([otherUser, ticketSystem], [ticketPrice.mul(-1), ticketPrice]);
    });

    it("should apply discounts when user owns a privilege card", async function () {
      const discountedPrice = ticketPrice.sub(ticketPrice.mul(10).div(100)); // Assuming a 10% discount
      await expect(ticketSystem.connect(user).buyTicket({ value: discountedPrice }))
        .to.changeEtherBalances([user, ticketSystem], [discountedPrice.mul(-1), discountedPrice]);
    });
  });
});
