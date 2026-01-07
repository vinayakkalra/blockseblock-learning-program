import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { useQuickStarterContract } from "../hooks/useQuickStarterContract";
import toast from "react-hot-toast";

const InvestModal = ({ project, onClose, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const { provider, signer, isConnected, isSupportedNetwork } = useWallet();
  const { invest } = useQuickStarterContract(provider, signer);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const t = toast.loading("Investing…");
      await invest(project.id, amount);
      toast.dismiss(t);
      toast.success("Investment successful 💰");
      onSuccess();
    } catch (err) {
      toast.error(err.reason || "Investment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Invest in {project.name}</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            step="0.001"
            min="0.001"
            placeholder="ETH amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field"
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Invest"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InvestModal;
