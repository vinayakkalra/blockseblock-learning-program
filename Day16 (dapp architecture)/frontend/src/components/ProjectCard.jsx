import React, { useState } from "react";
import { Wallet } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { useQuickStarterContract } from "../hooks/useQuickStarterContract";
import InvestModal from "./InvestModal";

const ProjectCard = ({ project, onUpdate }) => {
  const [showInvest, setShowInvest] = useState(false);
  const [loading, setLoading] = useState(false);

  const { account, provider, signer } = useWallet();
  const { withdraw } = useQuickStarterContract(provider, signer);

  const isOwner =
    account && project.owner.toLowerCase() === account.toLowerCase();

  const handleWithdraw = async () => {
    setLoading(true);
    await withdraw(project.id);
    setLoading(false);
    onUpdate();
  };

  return (
    <>
      <div className="card">
        <h3 className="font-semibold">{project.name}</h3>
        <p className="text-sm">Goal: {project.goal} ETH</p>
        <p className="text-sm">Raised: {project.raised} ETH</p>

        {project.isActive && !isOwner && (
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
            {loading ? "Withdrawing..." : "Withdraw"}
          </button>
        )}
      </div>

      {showInvest && (
        <InvestModal
          project={project}
          onClose={() => setShowInvest(false)}
          onSuccess={onUpdate}
        />
      )}
    </>
  );
};

export default ProjectCard;
