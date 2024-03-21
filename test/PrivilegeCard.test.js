const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivilegeCard Contract", function () {
  let PrivilegeCard;
  let privilegeCard;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    PrivilegeCard = await ethers.getContractFactory("PrivilegeCard");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    privilegeCard = await PrivilegeCard.deploy(owner.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await privilegeCard.owner()).to.equal(owner.address);
    });
  });

  describe("Creating and buying cards", function () {
    beforeEach(async function () {
      await privilegeCard.createCard(
        "Gold Card",
        "Premium Access",
        ethers.parseEther("0.1"),
        100,
        10
      );
    });

    it("Should let users buy a card", async function () {
      await expect(
        privilegeCard
          .connect(addr1)
          .buyCard(0, { value: ethers.parseEther("0.1") })
      )
        .to.emit(privilegeCard, "CardBought")
        .withArgs(0, addr1.address, 1);
    });

    it("Should fail to buy a card without sufficient funds", async function () {
      await expect(
        privilegeCard
          .connect(addr1)
          .buyCard(0, { value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("Insufficient funds");
    });

    it("Should not allow buying a card more than once per account", async function () {
      await privilegeCard
        .connect(addr1)
        .buyCard(0, { value: ethers.parseEther("0.1") });
      await expect(
        privilegeCard
          .connect(addr1)
          .buyCard(0, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Card already bought by this account");
    });

    it("Should respect the max supply of cards", async function () {
      const maxSupply = 2;
      await privilegeCard.createCard(
        "Silver Card",
        "Standard Access",
        ethers.parseEther("0.05"),
        maxSupply,
        5
      );
      await privilegeCard
        .connect(addr1)
        .buyCard(1, { value: ethers.parseEther("0.05") });
      await privilegeCard
        .connect(addr2)
        .buyCard(1, { value: ethers.parseEther("0.05") });

      await expect(
        privilegeCard
          .connect(addrs[0])
          .buyCard(1, { value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("Max supply reached");
    });
  });

  describe("Utility functions", function () {
    beforeEach(async function () {
      await privilegeCard.createCard(
        "Bronze Card",
        "Basic Access",
        ethers.parseEther("0.01"),
        50,
        2
      );
      await privilegeCard
        .connect(addr1)
        .buyCard(0, { value: ethers.parseEther("0.01") });
    });

    it("Should return the correct card type for a token", async function () {
      const cardType = await privilegeCard.getCardType(1); // Assuming token ID 1 was minted first
      expect(cardType).to.equal(0);
    });

    it("Should return the correct total number of cards created", async function () {
      const totalCards = await privilegeCard.getTotalCards();
      expect(totalCards).to.equal(1);
    });
  });
});
