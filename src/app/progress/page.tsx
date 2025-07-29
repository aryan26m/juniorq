'use client';

import { useAssignmentProgress } from '@/contexts/AssignmentProgressContext';

export default function ProgressPage() {
  const { assignments, done, setDone } = useAssignmentProgress();
  const completed = assignments.filter((a) => done[a.id]);
  const totalPoints = completed.reduce((sum, a) => sum + a.points, 0);

  const handleToggle = (id: string) => {
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-dark-card text-white rounded-xl shadow-lg p-8 border border-dark-lighter">
      <h1 className="text-3xl font-bold mb-8 text-primary">Progress</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-accent">Completed Assignments</h2>
        {completed.length === 0 ? (
          <div className="text-lg text-gray-400 p-6 bg-dark-lighter rounded-xl border-2 border-white shadow-lg">
            Do assignments and get points!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completed.map((a) => (
              <div
                key={a.id}
                className="bg-dark-lighter rounded-xl p-6 border-2 border-white shadow-lg flex flex-col gap-4 transition-all duration-200 opacity-100"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">{a.title}</span>
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
                <span className="ml-1 text-info text-sm">Points: {a.points}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2 text-accent">Total Points Achieved</h2>
        <div className="text-3xl font-bold text-success">{totalPoints}</div>
      </div>
    </div>
  );
} 