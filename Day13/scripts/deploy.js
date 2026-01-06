import hre from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer, admin] = await hre.ethers.getSigners();

  console.log("Deployer:", deployer.address);
  console.log("Admin:", admin.address);

  // 1️⃣ Deploy Logic V1
  const LogicV1 = await hre.ethers.getContractFactory("TransparentLogicV1");
  const logicV1 = await LogicV1.deploy();
  await logicV1.waitForDeployment();

  const logicV1Address = await logicV1.getAddress();
  console.log("LogicV1:", logicV1Address);

  // 2️⃣ Deploy ProxyAdmin
  const ProxyAdminFactory = await hre.ethers.getContractFactory("ProxyAdmin");
  const proxyAdmin = await ProxyAdminFactory.deploy(admin.address);
  await proxyAdmin.waitForDeployment();

  const proxyAdminAddress = await proxyAdmin.getAddress();
  console.log("ProxyAdmin:", proxyAdminAddress);

  // 3️⃣ Deploy Transparent Proxy
  const ProxyFactory = await hre.ethers.getContractFactory(
    "TransparentUpgradeableProxy"
  );

  const proxy = await ProxyFactory.deploy(
    logicV1Address,
    proxyAdminAddress,
    "0x"
  );

  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  console.log("Proxy:", proxyAddress);

  console.log("\nSave in .env 👇");
  console.log("PROXY=", proxyAddress);
  console.log("PROXY_ADMIN=", proxyAdminAddress);
}

main().catch(console.error);
