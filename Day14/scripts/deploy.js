import hre from "hardhat";

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();

  console.log("Deploying locally with:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  // =================================================
  // 1️⃣ Deploy Mock ERC20 (Deposit Token)
  // =================================================

  const ERC20Mock = await ethers.getContractFactory("ERC20Mock");

  const depositToken = await ERC20Mock.deploy(
    "Mock WETH",
    "mWETH",
    deployer.address,
    ethers.parseEther("100000")
  );
  await depositToken.waitForDeployment();

  console.log("DepositToken:", await depositToken.getAddress());

  // =================================================
  // 2️⃣ Deploy Mock aToken
  // =================================================

  const aToken = await ERC20Mock.deploy(
    "Mock aWETH",
    "maWETH",
    deployer.address,
    ethers.parseEther("100000")
  );
  await aToken.waitForDeployment();

  console.log("aToken:", await aToken.getAddress());

  // =================================================
  // 3️⃣ Deploy Mock Aave Pool
  // =================================================

  const MockAavePool = await ethers.getContractFactory("MockAavePool");
  const mockAavePool = await MockAavePool.deploy(
    await depositToken.getAddress(),
    await aToken.getAddress()
  );
  await mockAavePool.waitForDeployment();

  console.log("MockAavePool:", await mockAavePool.getAddress());

  // =================================================
  // 4️⃣ Deploy Mock VRF Coordinator
  // =================================================

  const MockVRFCoordinator = await ethers.getContractFactory(
    "MockVRFCoordinator"
  );
  const mockVRF = await MockVRFCoordinator.deploy();
  await mockVRF.waitForDeployment();

  console.log("MockVRFCoordinator:", await mockVRF.getAddress());

  // =================================================
  // 5️⃣ Deploy YieldPrizePool
  // =================================================

  const YieldPrizePool = await ethers.getContractFactory("YieldPrizePool");

  const yieldPrizePool = await YieldPrizePool.deploy(
    await mockAavePool.getAddress(),
    await depositToken.getAddress(),
    await aToken.getAddress(),
    await mockVRF.getAddress(),
    ethers.ZeroHash, // keyHash not needed locally
    1               // subscriptionId dummy
  );

  await yieldPrizePool.waitForDeployment();

  console.log(
    "YieldPrizePool deployed at:",
    await yieldPrizePool.getAddress()
  );

  console.log("\n✅ Local deployment complete");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
