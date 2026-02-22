import { useState, useEffect, useRef } from 'react';
import Mindmap from './components/Mindmap';
import { departments, departmentList } from './data';
import { useCompletedCourses } from './hooks/useCompletedCourses';
import { toPersianDigits } from './components/CourseNode';
import { startTour } from './components/onboarding';

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
  const [showContribute, setShowContribute] = useState(false);
  const [showDeptMenu, setShowDeptMenu] = useState(false);
  const contributeRef = useRef<HTMLDivElement>(null);
  const deptMenuRef = useRef<HTMLDivElement>(null);

  const currentDept = departments[active];

  const [completedIds, toggleCompleted, clearAllCompleted] = useCompletedCourses(active);

  // Close popovers on outside click
  useEffect(() => {
    if (!showContribute && !showDeptMenu) return;
    const handler = (e: MouseEvent) => {
      if (showContribute && contributeRef.current && !contributeRef.current.contains(e.target as Node)) {
        setShowContribute(false);
      }
      if (showDeptMenu && deptMenuRef.current && !deptMenuRef.current.contains(e.target as Node)) {
        setShowDeptMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showContribute, showDeptMenu]);

  // Auto-start guided tour on first visit
  useEffect(() => {
    try {
      if (!localStorage.getItem('roadmap-tour-seen')) {
        localStorage.setItem('roadmap-tour-seen', 'true');
        // Small delay so the mindmap renders first
        const timer = setTimeout(() => startTour(), 600);
        return () => clearTimeout(timer);
      }
    } catch { /* private browsing */ }
  }, []);

  const completedCredits = currentDept.courses.reduce(
    (sum, c) => sum + (completedIds.has(c.id) ? c.credits : 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
        <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          {/* Right side: Title + department tabs */}
          <div className="flex items-center gap-4 min-w-0">
            <h1 className="text-sm sm:text-base font-bold whitespace-nowrap">
              نقشه راه
            </h1>
            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block shrink-0" />
            {/* Mobile: dropdown selector */}
            <div className="relative sm:hidden shrink-0" ref={deptMenuRef}>
              <button
                onClick={() => setShowDeptMenu((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-sm font-medium shadow-sm cursor-pointer transition-all active:scale-95 whitespace-nowrap"
              >
                <span>{currentDept.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${showDeptMenu ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {showDeptMenu && (
                <div className="absolute top-full mt-1.5 right-0 min-w-[180px] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1.5 z-50 animate-fade-in">
                  {departmentList.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => { setActive(dept.id); setShowDeptMenu(false); }}
                      className={`w-full text-right px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                        active === dept.id
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {active === dept.id && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                        <span>{dept.label}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Desktop: horizontal tabs */}
            <nav className="hidden sm:flex items-center gap-1.5">
              {departmentList.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setActive(dept.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                    active === dept.id
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {dept.label}
                </button>
              ))}
            </nav>
            <div className="relative shrink-0 hidden sm:block" ref={contributeRef}>
              <button
                onClick={() => setShowContribute((v) => !v)}
                className="px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-primary-400 hover:text-primary-500 dark:hover:border-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                title="افزودن نقشه راه رشته جدید"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              {showContribute && (
                <div className="absolute top-full mt-2 right-0 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 text-sm animate-fade-in">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">نقشه راه رشته‌تان را اضافه کنید</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    فقط کافیست یک فایل YAML بسازید و Pull Request بزنید — نیازی به تغییر کد نیست!
                  </p>
                  <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-start gap-2">
                      <span className="text-primary-500 font-bold mt-px">۱</span>
                      <span>مخزن را Fork کنید</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary-500 font-bold mt-px">۲</span>
                      <span>یک فایل <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-[11px]">.yaml</code> در <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-[11px]">src/data/roadmaps/</code> بسازید</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary-500 font-bold mt-px">۳</span>
                      <span>Pull Request ارسال کنید</span>
                    </div>
                  </div>
                  <a
                    href="https://github.com/CS-UT/department-roadmaps/blob/main/CONTRIBUTING.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    راهنمای مشارکت
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Left side: Credits + actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {completedIds.size > 0 && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full px-2.5 py-1">
                <span>✓</span>
                <span>{toPersianDigits(completedCredits)} واحد</span>
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
              href="https://plan.csut.ir"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              انتخاب واحد
            </a>
            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block shrink-0" />
            <button
              onClick={() => startTour()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="راهنمای استفاده"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </button>
            <a
              href="https://github.com/CS-UT/department-roadmaps"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
