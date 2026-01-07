import { useState, useEffect } from "react";
import { ethers } from "ethers";

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found");
      return;
    }

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

  // handle account + network change safely
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setSigner(null);
        setProvider(null);
      } else {
        connectWallet();
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
    isConnected: Boolean(account),
    isSupportedNetwork: () => chainId === 31337,
    connectWallet,
  };
};
