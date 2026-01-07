import QuickStarterABI from "../../../artifacts/contracts/QuickStarter.sol/QuickStarter.json";

export const SEPOLIA_CHAIN_ID = 11155111;

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export const CONTRACT_ABI = QuickStarterABI.abi;

export const CONTRACT_CONFIG = {
  address: CONTRACT_ADDRESS,
  chainId: SEPOLIA_CHAIN_ID,
  networkName: "Sepolia",
};
