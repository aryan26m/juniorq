"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export const assignments = [
  {
    title: 'Two Sum',
    link: 'https://leetcode.com/problems/two-sum/',
    id: 'two-sum',
    points: 50,
  },
  {
    title: 'Three Sum',
    link: 'https://leetcode.com/problems/3sum/',
    id: 'three-sum',
    points: 70,
  },
  {
    title: 'Create a To-Do App',
    link: '',
    id: 'todo-app',
    points: 100,
  },
];

type AssignmentProgressContextType = {
  done: { [id: string]: boolean };
  setDone: (updater: (prev: { [id: string]: boolean }) => { [id: string]: boolean }) => void;
  assignments: typeof assignments;
};

const AssignmentProgressContext = createContext<AssignmentProgressContextType | undefined>(undefined);

export function AssignmentProgressProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState<{ [id: string]: boolean }>({});
  return (
    <AssignmentProgressContext.Provider value={{ done, setDone, assignments }}>
      {children}
    </AssignmentProgressContext.Provider>
  );
}

export function useAssignmentProgress() {
  const ctx = useContext(AssignmentProgressContext);
  if (!ctx) throw new Error("useAssignmentProgress must be used within AssignmentProgressProvider");
  return ctx;
} 