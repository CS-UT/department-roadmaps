import { useMemo, useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type NodeMouseHandler,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CourseNode from './CourseNode';
import Legend from './Legend';
import { buildGraph } from './layoutEngine';
import type { DepartmentData } from '../data/types';
import type { CourseNodeData } from './CourseNode';

const nodeTypes = {
  course: CourseNode,
};

interface MindmapProps {
  department: DepartmentData;
}

export default function Mindmap({ department }: MindmapProps) {
  const { initialNodes, initialEdges, coursePrereqs, courseDependents } = useMemo(() => {
    const { nodes, edges } = buildGraph(department);

    // Build adjacency maps for highlighting
    const prereqs = new Map<string, Set<string>>();
    const dependents = new Map<string, Set<string>>();

    for (const course of department.courses) {
      prereqs.set(course.id, new Set(course.prerequisites ?? []));
      if (!dependents.has(course.id)) dependents.set(course.id, new Set());
      for (const preId of course.prerequisites ?? []) {
        if (!dependents.has(preId)) dependents.set(preId, new Set());
        dependents.get(preId)!.add(course.id);
      }
    }

    return {
      initialNodes: nodes,
      initialEdges: edges,
      coursePrereqs: prereqs,
      courseDependents: dependents,
    };
  }, [department]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Reset when department changes
  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedId(null);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const highlightConnections = useCallback(
    (nodeId: string | null) => {
      if (!nodeId) {
        // Reset all
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: { ...n.data, highlighted: false, dimmed: false },
          })),
        );
        setEdges(initialEdges);
        return;
      }

      // Collect all prerequisites (recursive)
      const allPrereqs = new Set<string>();
      const collectPrereqs = (id: string) => {
        for (const preId of coursePrereqs.get(id) ?? []) {
          if (!allPrereqs.has(preId)) {
            allPrereqs.add(preId);
            collectPrereqs(preId);
          }
        }
      };
      collectPrereqs(nodeId);

      // Collect all dependents (recursive)
      const allDeps = new Set<string>();
      const collectDeps = (id: string) => {
        for (const depId of courseDependents.get(id) ?? []) {
          if (!allDeps.has(depId)) {
            allDeps.add(depId);
            collectDeps(depId);
          }
        }
      };
      collectDeps(nodeId);

      const connectedIds = new Set([nodeId, ...allPrereqs, ...allDeps]);

      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            highlighted: n.id === nodeId,
            dimmed: !connectedIds.has(n.id),
          },
        })),
      );

      setEdges((eds) =>
        eds.map((e) => {
          const isConnected = connectedIds.has(e.source) && connectedIds.has(e.target);
          return {
            ...e,
            style: {
              ...e.style,
              opacity: isConnected ? 1 : 0.06,
              strokeWidth: isConnected ? 2.5 : 1,
            },
            animated: isConnected && (allPrereqs.has(e.source) || e.source === nodeId),
          };
        }),
      );
    },
    [coursePrereqs, courseDependents, setNodes, setEdges, initialEdges],
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const newId = selectedId === node.id ? null : node.id;
      setSelectedId(newId);
      highlightConnections(newId);
    },
    [selectedId, highlightConnections],
  );

  const onPaneClick = useCallback(() => {
    setSelectedId(null);
    highlightConnections(null);
  }, [highlightConnections]);

  // Find the selected course data for the info panel
  const selectedCourse = selectedId
    ? department.courses.find((c) => c.id === selectedId)
    : null;

  const selectedPrereqNames = selectedCourse?.prerequisites
    ?.map((pid) => department.courses.find((c) => c.id === pid)?.name)
    .filter(Boolean) as string[] | undefined;

  const selectedDependentNames = selectedId
    ? [...(courseDependents.get(selectedId) ?? [])]
        .map((did) => department.courses.find((c) => c.id === did)?.name)
        .filter(Boolean) as string[]
    : [];

  return (
    <div
      key={department.id}
      className="relative w-full"
      style={{ height: 'calc(100vh - 112px)', minHeight: '500px' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.08, maxZoom: 1 }}
        minZoom={0.2}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        className="bg-gray-50 dark:bg-gray-900"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#d1d5db"
          className="dark:!bg-gray-900 [.dark_&_.react-flow__background-pattern]:!fill-gray-700"
        />
        <Controls
          position="bottom-left"
          className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !rounded-lg !shadow-lg [&_button]:!bg-white [&_button]:dark:!bg-gray-800 [&_button]:!border-gray-200 [&_button]:dark:!border-gray-700 [&_button]:!rounded [&_button_svg]:!fill-gray-600 [&_button_svg]:dark:!fill-gray-300"
        />
        <MiniMap
          position="bottom-right"
          nodeColor={(node: Node) => {
            const data = node.data as CourseNodeData;
            switch (data?.category) {
              case 'base':
                return '#60a5fa';
              case 'specialized':
                return '#fb7185';
              case 'elective':
                return '#fbbf24';
              case 'special':
                return '#34d399';
              default:
                return '#9ca3af';
            }
          }}
          className="!bg-white/80 dark:!bg-gray-800/80 !border-gray-200 dark:!border-gray-700 !rounded-lg !shadow-lg"
          maskColor="rgba(0,0,0,0.08)"
        />
      </ReactFlow>

      {/* Legend - top right */}
      <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-gray-200 dark:border-gray-700 z-10">
        <Legend />
      </div>

      {/* Course detail panel */}
      {selectedCourse && (
        <div className="absolute top-3 left-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl border border-gray-200 dark:border-gray-700 z-10 max-w-[280px]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
              {selectedCourse.name}
            </h3>
            <button
              onClick={() => {
                setSelectedId(null);
                highlightConnections(null);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none cursor-pointer"
            >
              &times;
            </button>
          </div>
          <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
            <p>
              <span className="font-semibold text-gray-700 dark:text-gray-300">واحد: </span>
              {selectedCourse.credits}
            </p>
            <p>
              <span className="font-semibold text-gray-700 dark:text-gray-300">نوع: </span>
              {{ base: 'پایه', specialized: 'تخصصی', elective: 'اختیاری', special: 'خاص' }[selectedCourse.category]}
            </p>
            {selectedPrereqNames && selectedPrereqNames.length > 0 && (
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">پیشنیازها: </span>
                <ul className="mt-0.5 mr-3 list-disc">
                  {selectedPrereqNames.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedDependentNames.length > 0 && (
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">وابسته‌ها: </span>
                <ul className="mt-0.5 mr-3 list-disc">
                  {selectedDependentNames.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedCourse.corequisites && selectedCourse.corequisites.length > 0 && (
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">همنیاز: </span>
                {selectedCourse.corequisites
                  .map((cid) => department.courses.find((c) => c.id === cid)?.name)
                  .filter(Boolean)
                  .join('، ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
