import type { CourseCategory } from '../data/types';

const items: { label: string; color: string; activeColor: string; category: CourseCategory }[] = [
  { label: 'پایه', color: 'bg-blue-400', activeColor: 'ring-blue-400', category: 'base' },
  { label: 'تخصصی', color: 'bg-rose-400', activeColor: 'ring-rose-400', category: 'specialized' },
  { label: 'اختیاری', color: 'bg-amber-400', activeColor: 'ring-amber-400', category: 'elective' },
  { label: 'خاص', color: 'bg-purple-400', activeColor: 'ring-purple-400', category: 'special' },
];

const edgeItems = [
  { label: 'پیشنیاز', style: 'border-gray-500 border-t-2 w-6' },
  { label: 'همنیاز', style: 'border-emerald-500 border-t-2 border-dashed w-6' },
];

interface LegendProps {
  activeCategories: Set<CourseCategory>;
  onToggle: (category: CourseCategory) => void;
  showAvailable: boolean;
  onToggleAvailable: () => void;
}

export default function Legend({ activeCategories, onToggle, showAvailable, onToggleAvailable }: LegendProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
      {items.map((item) => {
        const active = activeCategories.has(item.category);
        return (
          <button
            key={item.category}
            onClick={() => onToggle(item.category)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-all cursor-pointer select-none
              ${active
                ? `ring-2 ${item.activeColor} bg-white dark:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100`
                : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 line-through'
              }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${item.color} ${active ? '' : 'opacity-30'}`} />
            {item.label}
          </button>
        );
      })}
      <span className="mx-0.5 text-gray-300 dark:text-gray-600">|</span>
      {edgeItems.map((item) => (
        <span key={item.label} className="flex items-center gap-1">
          <span className={item.style} />
          {item.label}
        </span>
      ))}
      <span className="mx-0.5 text-gray-300 dark:text-gray-600">|</span>
      {/* Eye toggle: available courses view */}
      <button
        data-tour="available-toggle"
        onClick={onToggleAvailable}
        className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all cursor-pointer select-none ${
          showAvailable
            ? 'ring-2 ring-green-400 bg-white dark:bg-gray-700 text-green-700 dark:text-green-400 font-semibold'
            : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
        title="نمایش دروس قابل اخذ"
      >
        {showAvailable ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        )}
        <span className="hidden sm:inline">قابل اخذ</span>
      </button>
      {/* Hint text when available view is active */}
      {showAvailable && (
        <span className="text-green-600 dark:text-green-400 text-[10px] font-medium hidden sm:inline">
          حالت دروس قابل اخذ فعال است
        </span>
      )}
    </div>
  );
}
