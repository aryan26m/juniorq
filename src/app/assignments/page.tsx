'use client';

import { useAssignmentProgress } from '@/contexts/AssignmentProgressContext';

export default function AssignmentsPage() {
  const { assignments, done, setDone } = useAssignmentProgress();

  const handleToggle = (id: string) => {
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-dark-card text-white rounded-xl shadow-lg p-8 border border-dark-lighter">
      <h1 className="text-3xl font-bold mb-8 text-primary">Assignments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((a) => (
          <div
            key={a.id}
            className="bg-dark-lighter rounded-xl p-6 border-2 border-white shadow-lg flex flex-col gap-4 transition-all duration-200 hover:shadow-2xl hover:border-primary/80 hover:ring-2 hover:ring-primary/30"
          >
            <div className="flex items-center justify-between">
              {a.link ? (
                <a href={a.link} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-primary hover:underline">
                  {a.title}
                </a>
              ) : (
                <span className="text-lg font-bold text-primary">{a.title}</span>
              )}
              <label className="flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={!!done[a.id]}
                  onChange={() => handleToggle(a.id)}
                  className="form-checkbox h-5 w-5 text-success bg-dark-card border-gray-600 rounded focus:ring-primary"
                />
                <span className="ml-2 text-success text-xl">
                  {done[a.id] ? '✔️' : ''}
                </span>
              </label>
            </div>
            <span className="ml-1 text-gray-400 text-sm">{a.link ? '(LeetCode)' : ''}</span>
            <span className="ml-1 text-info text-sm">Points: {a.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 