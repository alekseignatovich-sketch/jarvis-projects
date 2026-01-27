export default function ProjectList({ projects, activeProject, setActiveProject, onCreate }) {
  return (
    <div className="w-64 bg-gray-800 p-4 flex flex-col border-r border-gray-700 h-screen">
      <button
        onClick={onCreate}
        className="mb-4 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded flex items-center gap-2 font-medium"
      >
        ➕ Новый проект
      </button>
      <div className="overflow-y-auto flex-1 space-y-1">
        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => setActiveProject(p)}
            className={`p-2 cursor-pointer rounded truncate ${
              activeProject?.id === p.id ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}
