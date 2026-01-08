import { expect } from "chai";
import hre from "hardhat";

describe("NoLossLottery", function () {
  let noLossLottery: any;
  let owner: any;
  let user1: any;
  let user2: any;

  const aaveGatewayAddress = "0x387d311e47e80b498169e6fb51d3193167d89F7D";
  const wethAtokenAddress = "0x5b071b590a59395fE4025A0Ccc1FcC931AAc1830";
  const vrfCoordinatorAddress = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";
  const _subscriptionId = "65475778234661754709737836321753098820861917333925931285158900332838660037311";
  // const _subscriptionId = 1;
  const _keyHash = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";

  before(async function () {
    [owner, user1, user2] = await hre.ethers.getSigners();
    const NoLossLottery = await hre.ethers.getContractFactory("NoLossLottery");
    noLossLottery = await NoLossLottery.deploy(
      aaveGatewayAddress,
      wethAtokenAddress,
      vrfCoordinatorAddress,
      _subscriptionId,
      _keyHash
    );
    // await noLossLottery.deployed();
  });

  describe("Deployment", function () {
    it("Should deploy with the correct Aave gateway address", async function () {
      expect(await noLossLottery.wrappedTokenGateway()).to.equal(aaveGatewayAddress);
    });

    it("Should deploy with the correct Aave token address", async function () {
      expect(await noLossLottery.aToken()).to.equal(wethAtokenAddress);
    });

    it("Should set the owner correctly", async function () {
      expect(await noLossLottery.owner()).to.equal(owner.address);
    });
  });

  describe("Deposits", function () {
    it("Should allow users to deposit ETH and emit event", async function () {
      const depositAmount = hre.ethers.parseEther("0.01");
      await expect(
        noLossLottery.connect(user1).depositETH({ value: depositAmount })
      )
        .to.emit(noLossLottery, "Deposited")
        .withArgs(user1.address, depositAmount);

      expect(await noLossLottery.deposits(user1.address)).to.equal(depositAmount);
    });

    it("Should not allow zero deposit", async function () {
      await expect(
        noLossLottery.connect(user1).depositETH({ value: 0 })
      ).to.be.revertedWith("Deposit amount must be greater than zero");
    });
  });

  describe("Withdrawals", function () {
    it("Should allow users to withdraw their ETH", async function () {
      const depositAmount = hre.ethers.parseEther("0.001");
      await noLossLottery.connect(user1).depositETH({ value: depositAmount });

      // Simulate Aave withdrawal by funding contract with ETH (for test only)
      await user1.sendTransaction({ to: noLossLottery.address, value: depositAmount });

      await expect(
        noLossLottery.connect(user1).withdrawETH(depositAmount)
      )
        .to.emit(noLossLottery, "Withdrawn")
        .withArgs(user1.address, depositAmount);

      expect(await noLossLottery.deposits(user1.address)).to.equal(0);
    });

    it("Should not allow withdrawal of more than deposited", async function () {
      await expect(
        noLossLottery.connect(user1).withdrawETH(hre.ethers.parseEther("1"))
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Lottery", function () {
    it("Should only allow owner to pick winner", async function () {
      await expect(
        noLossLottery.connect(user1).pickWinner()
      ).to.be.revertedWith("Not the contract owner");
    });

    it("Should revert if no players", async function () {
      await expect(
        noLossLottery.connect(owner).pickWinner()
      ).to.be.revertedWith("No players in the lottery");
    });

    it("Should revert if no yield to distribute", async function () {
      await noLossLottery.connect(user1).depositETH({ value: hre.ethers.parseEther("0.001") });
      await expect(
        noLossLottery.connect(owner).pickWinner()
      ).to.be.revertedWith("No yield to distribute");
    });
  });

  describe("Emergency Withdraw", function () {
    it("Should allow only owner to emergency withdraw", async function () {
      await expect(
        noLossLottery.connect(user1).emergencyWithdraw()
      ).to.be.revertedWith("Not the contract owner");
    });
  });
});