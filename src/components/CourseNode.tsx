import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { CourseCategory } from '../data/types';

export interface CourseNodeData {
  label: string;
  credits: number;
  category: CourseCategory;
  highlighted?: boolean;
  dimmed?: boolean;
  [key: string]: unknown;
}

export type CourseNodeType = Node<CourseNodeData, 'course'>;

const categoryStyles: Record<CourseCategory, { bg: string; border: string; text: string; badge: string }> = {
  base: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    border: 'border-blue-300 dark:border-blue-600',
    text: 'text-blue-900 dark:text-blue-100',
    badge: 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
  },
  specialized: {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    border: 'border-rose-300 dark:border-rose-600',
    text: 'text-rose-900 dark:text-rose-100',
    badge: 'bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-200',
  },
  elective: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    border: 'border-amber-300 dark:border-amber-600',
    text: 'text-amber-900 dark:text-amber-100',
    badge: 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200',
  },
  special: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    border: 'border-emerald-300 dark:border-emerald-600',
    text: 'text-emerald-900 dark:text-emerald-100',
    badge: 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200',
  },
};

function CourseNodeComponent({ data }: NodeProps<CourseNodeType>) {
  const style = categoryStyles[data.category];
  const dimmed = data.dimmed ? 'opacity-15' : '';
  const highlighted = data.highlighted
    ? 'ring-2 ring-primary-500 dark:ring-primary-400 shadow-lg shadow-primary-200/60 dark:shadow-primary-800/60 scale-105'
    : '';

  return (
    <div
      className={`
        px-2.5 py-1.5 rounded-lg border-[1.5px] cursor-pointer
        transition-all duration-200
        w-[140px]
        hover:shadow-md hover:scale-[1.03]
        ${style.bg} ${style.border} ${dimmed} ${highlighted}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-300 dark:!bg-gray-600 !w-1.5 !h-1.5 !border-0 !min-w-0 !min-h-0"
      />
      <div className="flex items-start gap-1.5 justify-between">
        <p className={`text-[11px] font-bold leading-tight line-clamp-2 ${style.text}`}>
          {data.label}
        </p>
        <span
          className={`text-[9px] font-bold px-1 py-0.5 rounded-full shrink-0 leading-none ${style.badge}`}
        >
          {data.credits}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-300 dark:!bg-gray-600 !w-1.5 !h-1.5 !border-0 !min-w-0 !min-h-0"
      />
    </div>
  );
}

export default memo(CourseNodeComponent);
