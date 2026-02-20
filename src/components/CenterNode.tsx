import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

export interface CenterNodeData {
  label: string;
  [key: string]: unknown;
}

export type CenterNodeType = Node<CenterNodeData, 'center'>;

function CenterNodeComponent({ data }: NodeProps<CenterNodeType>) {
  return (
    <div className="px-6 py-4 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800 text-white shadow-xl shadow-primary-300/40 dark:shadow-primary-900/60 border-2 border-primary-400 dark:border-primary-500">
      <p className="text-base font-black text-center whitespace-nowrap">{data.label}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-white !w-3 !h-3 !border-2 !border-primary-600" />
      <Handle type="source" position={Position.Top} className="!bg-white !w-3 !h-3 !border-2 !border-primary-600" id="top" />
      <Handle type="source" position={Position.Left} className="!bg-white !w-3 !h-3 !border-2 !border-primary-600" id="left" />
      <Handle type="source" position={Position.Right} className="!bg-white !w-3 !h-3 !border-2 !border-primary-600" id="right" />
    </div>
  );
}

export default memo(CenterNodeComponent);
