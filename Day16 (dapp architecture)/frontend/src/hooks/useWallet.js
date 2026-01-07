import { useState, useEffect } from "react";
import { ethers } from "ethers";

const SEPOLIA_CHAIN_ID = 11155111;

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");

    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    await browserProvider.send("eth_requestAccounts", []);

    const signer = await browserProvider.getSigner();
    const address = await signer.getAddress();
    const network = await browserProvider.getNetwork();

    setProvider(browserProvider);
    setSigner(signer);
    setAccount(address);
    setChainId(Number(network.chainId));
  };

  const switchToSepolia = async () => {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    });
  };

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.on("accountsChanged", connectWallet);
    window.ethereum.on("chainChanged", () => window.location.reload());

    return () => {
      window.ethereum.removeAllListeners();
    };
  }, []);

  return {
    account,
    provider,
    signer,
    chainId,
    isConnected: !!account,
    isSupportedNetwork: () => chainId === SEPOLIA_CHAIN_ID,
    connectWallet,
    switchToSepolia,
  };
};
