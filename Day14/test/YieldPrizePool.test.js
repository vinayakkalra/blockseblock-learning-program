import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("YieldPrizePool", function () {
  let owner, user1, user2;
  let yieldPool, token, aToken, aavePool, vrf;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // =================================================
    // 1️⃣ Deploy Mock ERC20 (deposit token)
    // =================================================
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");

    token = await ERC20Mock.deploy(
      "Mock Token",
      "MTK",
      owner.address,
      ethers.parseEther("100000")
    );
    await token.waitForDeployment();

    aToken = await ERC20Mock.deploy(
      "Mock aToken",
      "aMTK",
      owner.address,
      ethers.parseEther("100000")
    );
    await aToken.waitForDeployment();

    // =================================================
    // 2️⃣ Deploy Mock Aave Pool
    // =================================================
    const MockAavePool = await ethers.getContractFactory("MockAavePool");

    aavePool = await MockAavePool.deploy(
      await token.getAddress(),
      await aToken.getAddress()
    );
    await aavePool.waitForDeployment();

    // =================================================
    // 3️⃣ Deploy Mock VRF Coordinator
    // =================================================
    const MockVRFCoordinator = await ethers.getContractFactory(
      "MockVRFCoordinator"
    );

    vrf = await MockVRFCoordinator.deploy();
    await vrf.waitForDeployment();

    // =================================================
    // 4️⃣ Deploy YieldPrizePool
    // =================================================
    const YieldPrizePool = await ethers.getContractFactory("YieldPrizePool");

    yieldPool = await YieldPrizePool.deploy(
      await aavePool.getAddress(),
      await token.getAddress(),
      await aToken.getAddress(),
      await vrf.getAddress(),
      ethers.ZeroHash, // keyHash (not used locally)
      1                // subscriptionId (dummy)
    );
    await yieldPool.waitForDeployment();

    // =================================================
    // 5️⃣ Fund users
    // =================================================
    await token.transfer(user1.address, ethers.parseEther("1000"));
    await token.transfer(user2.address, ethers.parseEther("1000"));
  });

  // =================================================
  // ✅ TEST: Deposit
  // =================================================
  it("allows users to deposit", async function () {
    await token
      .connect(user1)
      .approve(await yieldPool.getAddress(), ethers.parseEther("100"));

    await yieldPool.connect(user1).deposit(ethers.parseEther("100"));

    expect(await yieldPool.totalDeposits()).to.equal(
      ethers.parseEther("100")
    );
  });

  // =================================================
  // ✅ TEST: Track players
  // =================================================
  it("tracks players correctly", async function () {
    await token
      .connect(user1)
      .approve(await yieldPool.getAddress(), ethers.parseEther("100"));
    await token
      .connect(user2)
      .approve(await yieldPool.getAddress(), ethers.parseEther("100"));

    await yieldPool.connect(user1).deposit(ethers.parseEther("100"));
    await yieldPool.connect(user2).deposit(ethers.parseEther("100"));

    expect(await yieldPool.getPlayersCount()).to.equal(2);
  });
});
