import "@nomicfoundation/hardhat-toolbox";

const config = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  paths: {
    artifacts: "./artifacts",
  },
};

export default config;
