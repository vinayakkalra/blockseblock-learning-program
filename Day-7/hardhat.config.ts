import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

/* 
  Get alchemy key from https://www.alchemy.com/rpc/ethereum-sepolia
  Get Sepolia private key from metamask
  Uncomment and use below lines to change network from localhost to sepolia

  To deploy to sepolia use the command npx hardhat ignition deploy ignition/modules/Coffee.ts --network sepolia
*/

// const ALCHEMY_API_KEY = "YOUR_ALCHEMY_API_KEY_HERE";
// const SEPOLIA_PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE";


const config: HardhatUserConfig = {
  solidity: "0.8.28",
  // networks: {
  //   sepolia: {
  //     url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  //     accounts: [`0x${SEPOLIA_PRIVATE_KEY}`],
  //   },
  // }
};

export default config;
