import { useEffect, useState, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import { useQuickStarterContract } from "../hooks/useQuickStarterContract";
import ProjectCard from "./ProjectCard";
import toast from "react-hot-toast";

const ProjectList = ({ refreshTrigger }) => {
  const [projects, setProjects] = useState([]);
  const { provider, signer } = useWallet();
  const { getAllProjects } = useQuickStarterContract(provider, signer);

  const fetchProjects = useCallback(async () => {
    try {
      const data = await getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    }
  }, [getAllProjects]);

  useEffect(() => {
    if (provider) fetchProjects();
  }, [provider, refreshTrigger, fetchProjects]);

  if (!projects.length)
    return <p className="text-center text-gray-500">No projects yet</p>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} onUpdate={fetchProjects} />
      ))}
    </div>
  );
};

export default ProjectList;
