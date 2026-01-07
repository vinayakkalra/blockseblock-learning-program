import { useEffect, useState, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import { useQuickStarterContract } from "../hooks/useQuickStarterContract";
import ProjectCard from "./ProjectCard";

const ProjectList = ({ refreshTrigger }) => {
  const [projects, setProjects] = useState([]);
    const { provider, signer } = useWallet();
    const { getAllProjects } = useQuickStarterContract(provider, signer);

  const fetchProjects = useCallback(async () => {
    const data = await getAllProjects();
    setProjects(data);
  }, [getAllProjects]);

  useEffect(() => {
    if (provider) fetchProjects();
  }, [provider, refreshTrigger, fetchProjects]);

  return (
    <div className="grid grid-cols-3 gap-4">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
};

export default ProjectList;
