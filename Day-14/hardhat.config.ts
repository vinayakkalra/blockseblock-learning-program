import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('@openzeppelin/hardhat-upgrades');

/* 
  Get alchemy key from https://www.alchemy.com/rpc/ethereum-sepolia
  Get Sepolia private key from metamask
  Uncomment and use below lines to change network from localhost to sepolia

  To deploy to sepolia use the command npx hardhat ignition deploy ignition/modules/Coffee.ts --network sepolia
*/

const ALCHEMY_API_KEY = "dAjCVUD_1Fi5xhvPTfzQT";
const SEPOLIA_PRIVATE_KEY = "26a6954def47e05b806ef9be7b2009b3dcbf261939340507312deb4932112414";


const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [`0x${SEPOLIA_PRIVATE_KEY}`],
    },
  }
};

export default config;