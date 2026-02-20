import { useState, useCallback, useEffect } from 'react';

function getStorageKey(deptId: string) {
  return `roadmap-completed-${deptId}`;
}

function loadCompleted(deptId: string): Set<string> {
  try {
    const raw = localStorage.getItem(getStorageKey(deptId));
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch { /* private browsing / corrupt data */ }
  return new Set();
}

function saveCompleted(deptId: string, ids: Set<string>) {
  try {
    localStorage.setItem(getStorageKey(deptId), JSON.stringify([...ids]));
  } catch { /* ignore */ }
}

export function useCompletedCourses(departmentId: string) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => loadCompleted(departmentId));

  // Reload when department changes
  useEffect(() => {
    setCompletedIds(loadCompleted(departmentId));
  }, [departmentId]);

  const toggleCompleted = useCallback(
    (courseId: string) => {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (next.has(courseId)) {
          next.delete(courseId);
        } else {
          next.add(courseId);
        }
        saveCompleted(departmentId, next);
        return next;
      });
    },
    [departmentId],
  );

  const clearAll = useCallback(() => {
    setCompletedIds(new Set());
    saveCompleted(departmentId, new Set());
  }, [departmentId]);

  return [completedIds, toggleCompleted, clearAll] as const;
}
