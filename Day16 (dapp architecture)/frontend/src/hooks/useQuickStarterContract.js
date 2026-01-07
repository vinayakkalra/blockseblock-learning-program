import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../constants/contract";

export const useQuickStarterContract = (provider, signer) => {
  if (!CONTRACT_ADDRESS) return {};

  const read =
    provider && new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

  const write =
    signer && new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  // 🔥 CREATE PROJECT
  const createProject = async (name, goalEth, initialEth) => {
    if (!write) throw new Error("Wallet not connected");

    const tx = await write.createProject(
      name,
      ethers.parseEther(goalEth),
      { value: ethers.parseEther(initialEth) }
    );

    const receipt = await tx.wait(); // ⬅️ wait till mined
    return { tx, receipt };
  };

  // 🔥 GET PROJECTS
  const getAllProjects = async () => {
    if (!read) return [];

    const count = await read.projectCount(); // ✅ IMPORTANT
    const projects = [];

    for (let i = 0; i < Number(count); i++) {
      const p = await read.projects(i);
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

  const invest = async (id, eth) => {
    const tx = await write.invest(id, {
      value: ethers.parseEther(eth),
    });
    return tx.wait();
  };

  const withdraw = async (id) => {
    const tx = await write.withdraw(id);
    return tx.wait();
  };

  return { createProject, getAllProjects, invest, withdraw };
};
