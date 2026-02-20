import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { CourseCategory } from '../data/types';

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
export const toPersianDigits = (n: number | string): string =>
  String(n).replace(/\d/g, (d) => persianDigits[+d]);

export interface CourseNodeData {
  label: string;
  credits: number;
  category: CourseCategory;
  highlighted?: boolean;
  dimmed?: boolean;
  completed?: boolean;
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
  const isCompleted = !!data.completed;
  const isDimmed = !!data.dimmed;
  const isCompletedDimmed = isCompleted && isDimmed;

  // Three visual tiers:
  //   1. Normal completed: full color + green accent + badge
  //   2. Completed but dimmed (available view): muted green card, still recognizable
  //   3. Locked/dimmed: very faint ghost
  const dimmed = isDimmed && !isCompletedDimmed ? 'opacity-15' : '';

  const highlighted = data.highlighted
    ? 'ring-2 ring-primary-500 dark:ring-primary-400 shadow-lg shadow-primary-200/60 dark:shadow-primary-800/60 scale-105'
    : '';

  // Completed-dimmed gets a special green-tinted style instead of category colors
  const bgStyle = isCompletedDimmed
    ? 'bg-green-100/60 dark:bg-green-900/25'
    : style.bg;
  const borderStyle = isCompletedDimmed
    ? 'border-green-300 dark:border-green-700'
    : isCompleted
      ? `${style.border} border-r-[3px] border-r-green-500`
      : style.border;
  const textStyle = isCompletedDimmed
    ? 'text-green-800/50 dark:text-green-400/50'
    : style.text;
  const badgeStyle = isCompletedDimmed
    ? 'bg-green-200/50 dark:bg-green-800/30 text-green-700/50 dark:text-green-400/40'
    : style.badge;
  const opacityStyle = isCompleted && !isDimmed ? 'opacity-80' : '';

  return (
    <div
      className={`
        relative px-2.5 py-1.5 rounded-lg border-[1.5px] cursor-pointer
        transition-all duration-200
        w-[140px]
        hover:shadow-md hover:scale-[1.03]
        ${bgStyle} ${borderStyle} ${dimmed} ${highlighted} ${opacityStyle}
      `}
    >
      {/* Checkmark badge: visible for completed (normal), smaller muted for completed-dimmed */}
      {isCompleted && !isDimmed && (
        <span className="absolute -top-1.5 -right-1.5 w-[14px] h-[14px] rounded-full bg-green-500 flex items-center justify-center text-white text-[8px] leading-none shadow-sm z-10">
          ✓
        </span>
      )}
      {isCompletedDimmed && (
        <span className="absolute -top-1 -right-1 w-[12px] h-[12px] rounded-full bg-green-400/60 dark:bg-green-500/40 flex items-center justify-center text-white/80 text-[7px] leading-none z-10">
          ✓
        </span>
      )}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-300 dark:!bg-gray-600 !w-1.5 !h-1.5 !border-0 !min-w-0 !min-h-0"
      />
      <div className="flex items-start gap-1.5 justify-between">
        <p className={`text-[11px] font-bold leading-tight line-clamp-2 ${textStyle}`}>
          {data.label}
        </p>
        <span
          className={`text-[9px] font-bold w-[16px] h-[16px] rounded-full shrink-0 flex items-center justify-center ${badgeStyle}`}
        >
          {toPersianDigits(data.credits)}
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
