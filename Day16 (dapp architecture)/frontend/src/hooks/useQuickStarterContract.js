import { useMemo } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { CONTRACT_ABI, CONTRACT_CONFIG } from "../constants/contract";

export const useQuickStarterContract = (provider, signer) => {
  const readContract = useMemo(() => {
    if (!provider) return null;
    return new ethers.Contract(
      CONTRACT_CONFIG.address,
      CONTRACT_ABI,
      provider
    );
  }, [provider]);

  const writeContract = useMemo(() => {
    if (!signer) return null;
    return new ethers.Contract(
      CONTRACT_CONFIG.address,
      CONTRACT_ABI,
      signer
    );
  }, [signer]);

  // ✅ CREATE PROJECT
  const createProject = async (name, goalEth) => {
    if (!writeContract) {
      toast.error("Connect wallet first");
      return;
    }

    try {
      const tx = await writeContract.createProject(
        name,
        ethers.parseEther(goalEth.toString())
      );
      toast.loading("Creating project...", { id: "create" });
      await tx.wait();
      toast.success("Project created!", { id: "create" });
    } catch (err) {
      toast.error(err.reason || "Transaction failed");
    }
  };

  // ✅ GET ALL PROJECTS
  const getAllProjects = async () => {
    if (!readContract) return [];

    const count = await readContract.projectCount();
    const projects = [];

    for (let i = 0; i < Number(count); i++) {
      const p = await readContract.getProject(i);
      projects.push({
        id: i,
        name: p.name,
        owner: p.owner,
        goal: ethers.formatEther(p.goalAmount),
        raised: ethers.formatEther(p.totalAmountRaised),
        isActive: p.isActive,
      });
    }

    return projects;
  };

  // ✅ INVEST
  const invest = async (projectId, eth) => {
    try {
      const tx = await writeContract.invest(projectId, {
        value: ethers.parseEther(eth.toString()),
      });
      toast.loading("Investing...", { id: "invest" });
      await tx.wait();
      toast.success("Investment successful", { id: "invest" });
    } catch (err) {
      toast.error(err.reason || "Investment failed");
    }
  };

  // ✅ WITHDRAW
  const withdraw = async (projectId) => {
    try {
      const tx = await writeContract.withdraw(projectId);
      toast.loading("Withdrawing...", { id: "withdraw" });
      await tx.wait();
      toast.success("Withdrawn", { id: "withdraw" });
    } catch (err) {
      toast.error(err.reason || "Withdraw failed");
    }
  };

  return {
    createProject,
    getAllProjects,
    invest,
    withdraw,
  };
};
