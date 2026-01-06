import hre from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const [, admin] = await hre.ethers.getSigners();

  const proxyAddress = process.env.PROXY;
  const proxyAdminAddress = process.env.PROXY_ADMIN;

  if (!proxyAddress) throw new Error("Set PROXY in .env");
  if (!proxyAdminAddress) throw new Error("Set PROXY_ADMIN in .env");

  // Deploy Logic V2
  const LogicV2 = await hre.ethers.getContractFactory("TransparentLogicV2");
  const logicV2 = await LogicV2.deploy();
  await logicV2.waitForDeployment();

  const logicV2Address = await logicV2.getAddress();
  console.log("LogicV2:", logicV2Address);

  // Attach ProxyAdmin
  const ProxyAdmin = await hre.ethers.getContractAt(
    "ProxyAdmin",
    proxyAdminAddress,
    admin
  );

  // ✅ OZ v5 upgrade
  const tx = await ProxyAdmin.upgradeAndCall(
    proxyAddress,
    logicV2Address,
    "0x"
  );
  await tx.wait();

  console.log("Proxy upgraded to:", logicV2Address);
}

main().catch(console.error);
