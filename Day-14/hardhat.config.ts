import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('@openzeppelin/hardhat-upgrades');

/* 
  Get alchemy key from https://www.alchemy.com/rpc/ethereum-sepolia
  Get Sepolia private key from metamask
  Uncomment and use below lines to change network from localhost to sepolia

  To deploy to sepolia use the command npx hardhat ignition deploy ignition/modules/Coffee.ts --network sepolia
*/

const ALCHEMY_API_KEY = "PWcA23WZ3lR0z_tcmyqyb";
const ACCOUNT_1_PRIVATE_KEY = "26a6954def47e05b806ef9be7b2009b3dcbf261939340507312deb4932112414";
const ACCOUNT_2_PRIVATE_KEY = "ac1a02f099b993f464850b4f6b55ac3203344c07dee78caad293ff77ad934853";
const ACCOUNT_3_PRIVATE_KEY = "eecdde1382b215dc7717bf52736dec4945b59d949582510142c8bb6eeb143e0f";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [`0x${ACCOUNT_1_PRIVATE_KEY}`, `0x${ACCOUNT_2_PRIVATE_KEY}`, `0x${ACCOUNT_3_PRIVATE_KEY}`],
    },
  }
};

export default config;