import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import ProjectList from '../components/ProjectList';
import ProjectView from '../components/ProjectView';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setProjects(data || []);
  };

  const createProject = async () => {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name: 'Новый проект' })
      .select()
      .single();
    if (error) console.error(error);
    else {
      setProjects([data, ...projects]);
      setActiveProject(data);
    }
  };

  return (
    <div className="flex h-screen">
      <ProjectList
        projects={projects}
        activeProject={activeProject}
        setActiveProject={setActiveProject}
        onCreate={createProject}
      />
      <ProjectView
        project={activeProject}
        onProjectUpdate={fetchProjects}
      />
    </div>
  );
}
