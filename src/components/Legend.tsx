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
}

export default function Legend({ activeCategories, onToggle }: LegendProps) {
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
    </div>
  );
}
