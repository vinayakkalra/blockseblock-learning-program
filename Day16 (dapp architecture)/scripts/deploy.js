import hre from "hardhat";

async function main() {
  const Contract = await hre.ethers.getContractFactory("QuickStarter");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  console.log("QuickStarter deployed to:", await contract.getAddress());
}

main();
