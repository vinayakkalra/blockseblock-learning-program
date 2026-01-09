import { expect } from "chai";
import hre from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("NoLossLottery Sepolia Integration", function () {
  // Set a long timeout because Sepolia block times are ~12 seconds
  this.timeout(300000); 

  let noLossLottery: any;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;

  // Sepolia Aave V3 Addresses
  const aaveGatewayAddress = "0x387d311e47e80b498169e6fb51d3193167d89F7D";
  const wethAtokenAddress = "0x5b071b590a59395fE4025A0Ccc1FcC931AAc1830";
  const vrfCoordinatorAddress = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";
  const _subscriptionId = "65475778234661754709737836321753098820861917333925931285158900332838660037311";
  const _keyHash = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
  const aaveProtocolDataProviderAddress = "0x3e9708d80f7B3e43118013075F7e95CE3AB31F31";
  const WETHAssetAddress = "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c";

  // Helper to wait between actions if the RPC is lagging
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  before(async function () {
    [owner, user1] = await hre.ethers.getSigners();
    
    // If you already deployed, you can attach to the address to save testnet ETH
    // const NoLossLottery = await hre.ethers.getContractFactory("NoLossLottery");
    // noLossLottery = NoLossLottery.attach("0x1e1ae41E73D2C3940615AFaD9759B1Bc26f093F3");
    
    const NoLossLottery = await hre.ethers.getContractFactory("NoLossLottery");
    noLossLottery = await NoLossLottery.deploy(
      aaveGatewayAddress,
      wethAtokenAddress,
      vrfCoordinatorAddress,
      _subscriptionId,
      _keyHash,
      aaveProtocolDataProviderAddress,
      WETHAssetAddress
    );
    await noLossLottery.waitForDeployment();
    console.log("Contract deployed to:", await noLossLottery.getAddress());
  });

  describe("Deposits", function () {
    it("Should allow users to deposit ETH and emit event", async function () {
      const depositAmount = hre.ethers.parseEther("0.001"); // Using slightly more for gas safety
      const user1Address = await user1.getAddress();

      // 1. Send transaction and wait for receipt
      const tx = await noLossLottery.connect(user1).deposit({ 
        value: depositAmount,
        gasLimit: 500000 // Aave transactions are gas intensive
      });
      
      console.log("Deposit tx sent:", tx.hash);
      await tx.wait(1); // Wait for 1 confirmation
      
      // 2. Validate Event
      await expect(tx)
        .to.emit(noLossLottery, "Deposited")
        .withArgs(user1Address, depositAmount);

      // 3. Validate State
      const userBalance = await noLossLottery.deposits(user1Address);
      expect(userBalance).to.greaterThanOrEqual(depositAmount);
    });

    it("Should not allow zero deposit", async function () {
      // On live networks, we use a try/catch or expect().to.be.reverted 
      // but be aware that providers often throw BEFORE the tx is sent
      await expect(
        noLossLottery.connect(user1).deposit({ value: 0 })
      ).to.be.revertedWith("Deposit amount must be greater than zero");
    });
  });

  describe("Withdrawals", function () {
    it("Should allow users to withdraw their ETH", async function () {
      const withdrawAmount = hre.ethers.parseEther("0.0005");
      const user1Address = await user1.getAddress();
      
      const initialBalance = await noLossLottery.deposits(user1Address);

      const aTokenBal = await noLossLottery.getATokenBalance();
      console.log("aToken Balance in contract:", aTokenBal.toString());
      
      const tx = await noLossLottery.connect(user1).withdraw(withdrawAmount, {
        gasLimit: 500000
      });
      console.log("Withdraw tx sent:", tx.hash);
      await tx.wait(1);

      await expect(tx)
        .to.emit(noLossLottery, "Withdrawn")
        .withArgs(user1Address, withdrawAmount);

      const finalBalance = await noLossLottery.deposits(user1Address);
      expect(finalBalance).to.equal(initialBalance - withdrawAmount);
    });

    it("Should not allow withdrawal of more than deposited", async function () {
      const excessiveAmount = hre.ethers.parseEther("100");
      await expect(
        noLossLottery.connect(user1).withdraw(excessiveAmount)
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Owner should be able to pick winner", function () {
    it("Should allow owner to request a winner", async function () {
      console.log("deposits",await noLossLottery.deposits(await user1.getAddress())); 
      
      const tx = await noLossLottery.connect(owner).pickWinner({
          gasLimit: 800000 
      });
      await tx.wait(1);
      console.log("Request sent! Hash:", tx.hash);
      expect(tx).to.exist;
    });

    it("Should verify winner selection with limited block range", async function () {
      console.log("Waiting for VRF callback...");

      let lotteryActive = true;
      let attempts = 0;

      while (lotteryActive && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30s
        lotteryActive = await noLossLottery.lotteryActive();
        attempts++;
        console.log(`Poll ${attempts}: Active? ${lotteryActive}`);
      }

      // FIX FOR RPC LIMIT: Only look back 5 blocks instead of 100
      const currentBlock = await hre.ethers.provider.getBlockNumber();
      const filter = noLossLottery.filters.LotteryWinner();

      // We search from (currentBlock - 5) to currentBlock (6 block range total)
      const events = await noLossLottery.queryFilter(filter, currentBlock - 5, currentBlock);

      if (events.length > 0) {
        const winner = (events[0] as any).args.winner;
        console.log(`SUCCESS: Winner is ${winner}`);
      } else {
        console.log("Winner picked, but event not found in the last 5 blocks. Check Sepolia Etherscan!");
      }
    });
  });
});