import { ethers } from "ethers";
import QuickStarterABI from "../../../artifacts/contracts/QuickStarter.sol/QuickStarter.json";
import toast from "react-hot-toast";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const useQuickStarterContract = (provider, signer) => {
  const readContract =
    provider &&
    new ethers.Contract(CONTRACT_ADDRESS, QuickStarterABI.abi, provider);

  // WRITE (THIS WAS BROKEN BEFORE)
  const writeContract =
    signer &&
    new ethers.Contract(CONTRACT_ADDRESS, QuickStarterABI.abi, signer);

  // ❗ SAFETY CHECK
  if (signer && !writeContract) {
    throw new Error("Signer exists but write contract not initialized");
  }

  // ---------------- CREATE PROJECT ----------------
  const createProject = async (name, goalEth, initialEth) => {
    try {
      toast.loading("Creating project...", { id: "create" });
       const tx = await writeContract.createProject(
      name,
      ethers.parseEther(goalEth),
      {
        value: ethers.parseEther(initialEth),
      }
    );

    toast.success("Project created!", { id: "create" });
    return await tx.wait();
    } catch (error) {
      console.log("Error : ",error);
      toast.success("Project created!", { id: "create" });
    }
    if (!writeContract) {
      throw new Error("Wallet not connected (no signer)");
    }
  };

  // ---------------- INVEST ----------------
  const invest = async (projectId, ethAmount) => {
    if (!writeContract) throw new Error("Wallet not connected");

    const tx = await writeContract.invest(projectId, {
      value: ethers.parseEther(ethAmount),
    });

    return await tx.wait();
  };

  // ---------------- WITHDRAW ----------------
  const withdraw = async (projectId) => {
    if (!writeContract) throw new Error("Wallet not connected");

    const tx = await writeContract.withdraw(projectId);
    return await tx.wait();
  };

  // ---------------- LIST PROJECTS ----------------
  const getAllProjects = async () => {
    if (!readContract) return [];

    const projects = [];
    let index = 0;

    while (true) {
      try {
        const p = await readContract.projects(index);

        projects.push({
          id: index,
          name: p.name,
          owner: p.owner,
          goal: ethers.formatEther(p.goalAmount),
          raised: ethers.formatEther(p.totalAmountRaised),
          isActive: p.isActive,
        });

        index++;
      } catch {
        break;
      }
    }

    return projects;
  };

  return {
    createProject,
    invest,
    withdraw,
    getAllProjects,
  };
};
