import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { useQuickStarterContract } from "../hooks/useQuickStarterContract";
import toast from "react-hot-toast";

const CreateProject = ({ onProjectCreated }) => {
  const [projectName, setProjectName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { provider, signer, isConnected, isSupportedNetwork } = useWallet();
  const { createProject } = useQuickStarterContract(provider, signer);

  
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isConnected || !isSupportedNetwork()) {
    toast.error("Connect wallet on Sepolia");
    return;
  }

  try {
    setIsCreating(true);

    const loadingToast = toast.loading("Creating project…");

    const { receipt } = await createProject(
      projectName.trim(),
      goalAmount,
      initialAmount
    );

    toast.dismiss(loadingToast);
    toast.success("🎉 Project created successfully!");

    console.log("TX RECEIPT:", receipt);

    setProjectName("");
    setGoalAmount("");
    setInitialAmount("");

    onProjectCreated(); // 🔥 TRIGGER REFRESH
  } catch (err) {
    console.error(err);
    toast.error(err.reason || err.message || "Transaction failed");
  } finally {
    setIsCreating(false);
  }
};


  const isFormValid =
    projectName.trim() &&
    Number(goalAmount) > 0 &&
    Number(initialAmount) > 0;

  const canSubmit =
    isConnected && isSupportedNetwork() && isFormValid && !isCreating;

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <Plus className="h-6 w-6 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          Create New Project
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PROJECT NAME */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter your project name"
            className="input-field"
            disabled={isCreating}
            maxLength={100}
          />
          <p className="mt-1 text-xs text-gray-500">
            {projectName.length}/100 characters
          </p>
        </div>

        {/* GOAL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Funding Goal (ETH)
          </label>
          <input
            type="number"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            placeholder="0.0"
            step="0.001"
            min="0.001"
            className="input-field"
            disabled={isCreating}
          />
          <p className="mt-1 text-xs text-gray-500">
            Total ETH you want to raise
          </p>
        </div>

        {/* INITIAL FUNDING */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Initial ETH (Locked in Contract)
          </label>
          <input
            type="number"
            value={initialAmount}
            onChange={(e) => setInitialAmount(e.target.value)}
            placeholder="0.01"
            step="0.001"
            min="0.001"
            className="input-field"
            disabled={isCreating}
          />
          <p className="mt-1 text-xs text-gray-500">
            This ETH will be deducted immediately
          </p>
        </div>

        {/* SUBMIT */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Project...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Create Project</span>
              </>
            )}
          </button>
        </div>

        {!isConnected && (
          <p className="text-sm text-red-600 text-center">
            Please connect your wallet
          </p>
        )}

        {isConnected && !isSupportedNetwork() && (
          <p className="text-sm text-red-600 text-center">
            Switch to Hardhat Localhost (Chain ID: 31337)
          </p>
        )}
      </form>
    </div>
  );
};

export default CreateProject;
