import "@nomicfoundation/hardhat-toolbox";

const ALCHEMY_API_KEY = "NP2an-FMSHKAB1qV7U0vBZP6w4g5Yiir";
const SEPOLIA_PRIVATE_KEY = "b863aa344a3f0dcd437a007692ace6f091a3eecb7aa594a64ac9512819710455"; 


const config = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [`0x${SEPOLIA_PRIVATE_KEY}`],
    },
  }
};

export default config;
