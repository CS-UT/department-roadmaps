import type { CourseCategory } from '../data/types';

const items: { label: string; color: string; activeColor: string; category: CourseCategory }[] = [
  { label: 'پایه', color: 'bg-blue-400', activeColor: 'ring-blue-400', category: 'base' },
  { label: 'تخصصی', color: 'bg-rose-400', activeColor: 'ring-rose-400', category: 'specialized' },
  { label: 'اختیاری', color: 'bg-amber-400', activeColor: 'ring-amber-400', category: 'elective' },
  { label: 'خاص', color: 'bg-emerald-400', activeColor: 'ring-emerald-400', category: 'special' },
];

const edgeItems = [
  { label: 'پیشنیاز', style: 'border-gray-500 border-t-2 w-6' },
  { label: 'همنیاز', style: 'border-emerald-500 border-t-2 border-dashed w-6' },
];

interface LegendProps {
  activeCategories: Set<CourseCategory>;
  onToggle: (category: CourseCategory) => void;
  completedCredits: number;
  totalCredits: number;
  onClearCompleted: () => void;
  hasCompleted: boolean;
}

export default function Legend({ activeCategories, onToggle, completedCredits, totalCredits, onClearCompleted, hasCompleted }: LegendProps) {
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
      <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
        <span>✓</span>
        <span>{completedCredits} از {totalCredits} واحد</span>
      </span>
      {hasCompleted && (
        <button
          onClick={onClearCompleted}
          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
          title="پاک کردن همه"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      )}
    </div>
  );
}
