import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying QuickStarter to local network...");
  console.log("📍 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

  // Deploy the contract
  const QuickStarter = await ethers.getContractFactory("QuickStarter");
  console.log("⏳ Deploying contract...");
  
  const contract = await QuickStarter.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ QuickStarter deployed at:", contractAddress);

  // Update the frontend contract configuration
  const contractConfigPath = path.join(process.cwd(), "frontend", "src", "constants", "contract.js");
  
  try {
    let configContent = fs.readFileSync(contractConfigPath, "utf8");
    
    // Replace the contract address
    configContent = configContent.replace(
      /address: "0x[a-fA-F0-9]{40}"/,
      `address: "${contractAddress}"`
    );
    
    fs.writeFileSync(contractConfigPath, configContent);
    
    console.log("🔄 Frontend configuration updated with new contract address");
    console.log("📝 Contract deployed to:", contractAddress);
    console.log("🌐 Network:", hre.network.name);
    console.log("🎯 Chain ID:", hre.network.config.chainId);
    
    // Test the contract by calling a view function
    const projectCount = await contract.projectCount();
    console.log("🧪 Contract test - Project count:", projectCount.toString());
    
    console.log("\n🎉 Local deployment completed successfully!");
    console.log("💡 You can now start the frontend and interact with the contract");
    
  } catch (error) {
    console.error("❌ Error updating frontend configuration:", error.message);
  }
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
