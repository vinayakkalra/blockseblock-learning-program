import { createContext, useContext } from "react";
import { useWallet as useWalletHook } from "../hooks/useWallet";

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const wallet = useWalletHook();
  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used inside WalletProvider");
  }
  return ctx;
};
