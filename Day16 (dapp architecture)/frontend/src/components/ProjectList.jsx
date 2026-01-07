import React, { useEffect, useState } from "react";
import { RefreshCw, Folder, AlertCircle } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { useQuickStarterContract } from "../hooks/useQuickStarterContract";
import ProjectCard from "./ProjectCard";

const ProjectList = ({ refreshTrigger }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { provider } = useWallet();
  const { getAllProjects } = useQuickStarterContract(provider, null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (provider) fetchProjects();
  }, [provider, refreshTrigger]);

  if (loading) {
    return <p className="text-center">Loading projects...</p>;
  }

  if (error) {
    return (
      <div className="card text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-2" />
        <p>{error}</p>
        <button onClick={fetchProjects} className="btn-primary mt-3">
          Retry
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="card text-center">
        <Folder className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        <p>No projects yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} onUpdate={fetchProjects} />
      ))}
    </div>
  );
};

export default ProjectList;
