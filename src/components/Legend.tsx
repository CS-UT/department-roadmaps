const items = [
  { label: 'دروس پایه', color: 'bg-blue-400' },
  { label: 'دروس تخصصی', color: 'bg-rose-400' },
  { label: 'دروس اختیاری', color: 'bg-amber-400' },
  { label: 'دروس خاص', color: 'bg-emerald-400' },
];

const edgeItems = [
  { label: 'پیشنیاز اصلی', style: 'border-gray-500 border-t-2 w-8' },
  { label: 'پیشنیاز اختیاری', style: 'border-amber-500 border-t-2 w-8 opacity-60' },
  { label: 'همنیاز', style: 'border-emerald-500 border-t-2 border-dashed w-8' },
];

export default function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
      <span className="font-bold text-gray-700 dark:text-gray-300">دروس:</span>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded ${item.color}`} />
          {item.label}
        </span>
      ))}
      <span className="mx-1 text-gray-300 dark:text-gray-600">|</span>
      <span className="font-bold text-gray-700 dark:text-gray-300">روابط:</span>
      {edgeItems.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className={item.style} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
