import { Wallet } from "lucide-react";
import { useWallet } from "../context/WalletContext";


const WalletConnection = () => {
  const {
    account,
    isConnected,
    isSupportedNetwork,
    connectWallet,
    switchToHardhat
  } = useWallet();

  if (!isConnected) {
    return (
      <div className="card text-center">
        <Wallet className="mx-auto mb-4" />
        <button onClick={connectWallet} className="btn-primary">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <p className="text-sm">Connected: {account}</p>
      {isConnected && !isSupportedNetwork() && (
        <button
          onClick={switchToHardhat}
          className="mt-2 text-sm text-red-600 underline"
        >
          Switch to Hardhat Localhost (31337)
        </button>
      )}

    </div>
  );
};

export default WalletConnection;
