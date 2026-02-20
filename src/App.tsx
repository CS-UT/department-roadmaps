import { useState, useEffect } from 'react';
import Mindmap from './components/Mindmap';
import { departments, departmentList } from './data';
import { useCompletedCourses } from './hooks/useCompletedCourses';
import { toPersianDigits } from './components/CourseNode';

type DepartmentId = (typeof departmentList)[number]['id'];

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('roadmap-dark-mode');
      if (saved !== null) return saved === 'true';
    } catch { /* private browsing */ }
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('roadmap-dark-mode', String(dark)); } catch { /* ignore */ }
  }, [dark]);

  return [dark, () => setDark((d) => !d)] as const;
}

function App() {
  const [active, setActive] = useState<DepartmentId>('cs');
  const [dark, toggleDark] = useDarkMode();

  const currentDept = departments[active];
  const currentInfo = departmentList.find((d) => d.id === active)!;

  const [completedIds, toggleCompleted, clearAllCompleted] = useCompletedCourses(active);

  const completedCredits = currentDept.courses.reduce(
    (sum, c) => sum + (completedIds.has(c.id) ? c.credits : 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <h1 className="text-sm sm:text-base font-bold truncate">
            نقشه راه دانشکده ریاضی، آمار و علوم کامپیوتر
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            {/* Completed credits badge */}
            {completedIds.size > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full px-2.5 py-1">
                <span>✓</span>
                <span>{toPersianDigits(completedCredits)} واحد گذرانده</span>
                <button
                  onClick={() => {
                    if (window.confirm('آیا از پاک کردن تمام دروس گذرانده اطمینان دارید؟')) {
                      clearAllCompleted();
                    }
                  }}
                  className="mr-0.5 p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-green-600 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                  title="پاک کردن همه"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </span>
            )}
            <a
              href={currentInfo.file}
              download
              className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors flex items-center gap-1"
              title="دانلود PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span className="hidden sm:inline">PDF</span>
            </a>
            <a
              href="https://plan.csut.ir"
              className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors"
            >
              برنامه‌ریزی انتخاب واحد
            </a>
            <a
              href="https://github.com/CS-UT/department-roadmaps"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
              title="GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer text-gray-600 dark:text-gray-300"
              title={dark ? 'حالت روشن' : 'حالت تاریک'}
            >
              {dark ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Department Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="max-w-[1600px] mx-auto px-4 py-2 flex gap-2">
          {departmentList.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setActive(dept.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                active === dept.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mindmap */}
      <div className="flex-1">
        <Mindmap
          department={currentDept}
          completedIds={completedIds}
          toggleCompleted={toggleCompleted}
        />
      </div>
    </div>
  );
}

export default App;
