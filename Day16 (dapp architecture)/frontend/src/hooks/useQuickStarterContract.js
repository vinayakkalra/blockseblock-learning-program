import { ethers } from "ethers";
import QuickStarterABI from "../../../artifacts/contracts/QuickStarter.sol/QuickStarter.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const useQuickStarterContract = (provider, signer) => {
  const readContract =
    provider &&
    new ethers.Contract(CONTRACT_ADDRESS, QuickStarterABI.abi, provider);

  const writeContract =
    signer &&
    new ethers.Contract(CONTRACT_ADDRESS, QuickStarterABI.abi, signer);

  // ---------------- CREATE PROJECT ----------------
  const createProject = async (name, goalEth, initialEth) => {
    if (!writeContract) throw new Error("Wallet not connected");

    const tx = await writeContract.createProject(
      name,
      ethers.parseEther(goalEth),
      { value: ethers.parseEther(initialEth) }
    );

    return await tx.wait();
  };

  // ---------------- LIST PROJECTS ----------------
  const getAllProjects = async () => {
    if (!readContract) return [];

    const projects = [];
    let i = 0;

    while (true) {
      try {
        const p = await readContract.projects(i);
        projects.push({
          id: i,
          name: p.name,
          owner: p.owner,
          goal: ethers.formatEther(p.goalAmount),
          raised: ethers.formatEther(p.totalAmountRaised),
          isActive: p.isActive,
        });
        i++;
      } catch {
        break;
      }
    }

    return projects;
  };

  return {
    createProject,
    getAllProjects,
  };
};
