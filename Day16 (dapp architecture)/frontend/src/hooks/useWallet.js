import { useState, useEffect } from "react";
import { ethers } from "ethers";

const SEPOLIA_CHAIN_ID = 11155111;

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const setupWallet = async () => {
    if (!window.ethereum) return;

    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await browserProvider.send("eth_accounts", []);

    if (accounts.length === 0) {
      setIsConnecting(false);
      return;
    }

    const signer = await browserProvider.getSigner();
    const network = await browserProvider.getNetwork();

    setProvider(browserProvider);
    setSigner(signer);
    setAccount(accounts[0]);
    setChainId(Number(network.chainId));
    setIsConnecting(false);
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");

    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    await browserProvider.send("eth_requestAccounts", []);

    const signer = await browserProvider.getSigner();
    const network = await browserProvider.getNetwork();

    setProvider(browserProvider);
    setSigner(signer);
    setAccount(await signer.getAddress());
    setChainId(Number(network.chainId));
  };

  const switchToSepolia = async () => {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }], 
    });
  };

  useEffect(() => {
    setupWallet(); 

    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setSigner(null);
        setProvider(null);
      } else {
        setupWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    isConnected: !!account,
    isSupportedNetwork: () => chainId === SEPOLIA_CHAIN_ID,
    connectWallet,
    switchToSepolia,
  };
};
