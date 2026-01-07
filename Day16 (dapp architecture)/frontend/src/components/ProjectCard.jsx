import React, { useState } from "react";
import { Wallet } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { useQuickStarterContract } from "../hooks/useQuickStarterContract";
import InvestModal from "./InvestModal";
import toast from "react-hot-toast";

const ProjectCard = ({ project, onUpdate }) => {
  const [showInvest, setShowInvest] = useState(false);
  const [loading, setLoading] = useState(false);

  const { account, provider, signer } = useWallet();
  const { withdraw } = useQuickStarterContract(provider, signer);

  const isOwner =
    account && project.owner.toLowerCase() === account.toLowerCase();

  const handleWithdraw = async () => {
  try {
    setLoading(true);
    const t = toast.loading("Withdrawing funds…");
    await withdraw(project.id);
    toast.dismiss(t);
    toast.success("Funds withdrawn 🎯");
    onUpdate();
  } catch (err) {
    toast.error(err.reason || "Withdraw failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <div className="card">
        <h3 className="font-semibold">{project.name}</h3>
        <p>Goal: {project.goal} ETH</p>
        <p>Raised: {project.raised} ETH</p>

        {!isOwner && project.isActive && (
          <button
            className="btn-primary w-full mt-3"
            onClick={() => setShowInvest(true)}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Invest
          </button>
        )}

        {isOwner && project.isActive && (
          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="btn-secondary w-full mt-3"
          >
            {loading ? "Withdrawing..." : "Withdraw Funds"}
          </button>
        )}
      </div>

      {showInvest && (
        <InvestModal
          project={project}
          onClose={() => setShowInvest(false)}
          onSuccess={() => {
            setShowInvest(false);
            onUpdate();
          }}
        />
      )}
    </>
  );
};

export default ProjectCard;
