import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  type NodeMouseHandler,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CourseNode, { toPersianDigits } from './CourseNode';
import Legend from './Legend';
import MapControls from './MapControls';
import { buildGraph } from './layoutEngine';
import type { DepartmentData, CourseCategory } from '../data/types';

const ALL_CATEGORIES: CourseCategory[] = ['base', 'specialized', 'elective', 'special'];

const nodeTypes = {
  course: CourseNode,
};

interface MindmapProps {
  department: DepartmentData;
  completedIds: Set<string>;
  toggleCompleted: (courseId: string) => void;
}

export default function Mindmap({ department, completedIds, toggleCompleted }: MindmapProps) {
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
  const [activeCategories, setActiveCategories] = useState<Set<CourseCategory>>(
    () => new Set(ALL_CATEGORIES),
  );

  const [showAvailable, setShowAvailable] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build a category lookup from department courses
  const categoryMap = useMemo(() => {
    const m = new Map<string, CourseCategory>();
    for (const c of department.courses) m.set(c.id, c.category);
    return m;
  }, [department]);

  // Compute available course IDs: not completed & all prereqs completed
  const availableIds = useMemo(() => {
    const available = new Set<string>();
    for (const course of department.courses) {
      if (completedIds.has(course.id)) continue;
      const prereqs = course.prerequisites ?? [];
      if (prereqs.every((pid) => completedIds.has(pid))) {
        available.add(course.id);
      }
    }
    return available;
  }, [department.courses, completedIds]);

  // Reset when department changes
  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedId(null);
    setActiveCategories(new Set(ALL_CATEGORIES));
    setShowAvailable(false);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Sync completedIds + showAvailable into node data
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        const cat = categoryMap.get(n.id);
        const filteredByCategory = cat ? !activeCategories.has(cat) : false;

        let dimmed = filteredByCategory;
        if (!filteredByCategory && showAvailable) {
          // In available view: only available courses stay colored
          dimmed = !availableIds.has(n.id);
        }

        return {
          ...n,
          data: {
            ...n.data,
            completed: completedIds.has(n.id),
            dimmed,
          },
        };
      }),
    );
  }, [completedIds, showAvailable, availableIds, activeCategories, categoryMap, setNodes]);

  // Also update edges when showAvailable changes
  useEffect(() => {
    if (!showAvailable) return;
    setEdges((eds) =>
      eds.map((e) => {
        const orig = initialEdges.find((ie) => ie.id === e.id);
        const srcAvailable = availableIds.has(e.source);
        const tgtAvailable = availableIds.has(e.target);
        const bothAvailable = srcAvailable && tgtAvailable;
        const srcCat = categoryMap.get(e.source);
        const tgtCat = categoryMap.get(e.target);
        const bothVisible =
          (srcCat ? activeCategories.has(srcCat) : true) &&
          (tgtCat ? activeCategories.has(tgtCat) : true);
        return {
          ...e,
          style: {
            ...(orig?.style ?? e.style),
            opacity: bothAvailable && bothVisible ? (orig?.style?.opacity ?? 0.25) : 0.03,
          },
          animated: false,
        };
      }),
    );
  }, [showAvailable, availableIds, activeCategories, categoryMap, initialEdges, setEdges]);

  const highlightConnections = useCallback(
    (nodeId: string | null) => {
      if (!nodeId) {
        // Reset — respect active category filter + available view
        setNodes((nds) =>
          nds.map((n) => {
            const cat = categoryMap.get(n.id);
            const filteredByCategory = cat ? !activeCategories.has(cat) : false;
            let dimmed = filteredByCategory;
            if (!filteredByCategory && showAvailable) {
              dimmed = !availableIds.has(n.id);
            }
            return {
              ...n,
              data: { ...n.data, highlighted: false, dimmed },
            };
          }),
        );
        setEdges((eds) =>
          eds.map((e) => {
            const orig = initialEdges.find((ie) => ie.id === e.id);
            const srcCat = categoryMap.get(e.source);
            const tgtCat = categoryMap.get(e.target);
            const bothCatVisible =
              (srcCat ? activeCategories.has(srcCat) : true) &&
              (tgtCat ? activeCategories.has(tgtCat) : true);
            let visible = bothCatVisible;
            if (visible && showAvailable) {
              visible = availableIds.has(e.source) && availableIds.has(e.target);
            }
            return {
              ...e,
              style: {
                ...(orig?.style ?? e.style),
                opacity: visible ? (orig?.style?.opacity ?? 0.25) : 0.03,
              },
              animated: false,
            };
          }),
        );
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
        nds.map((n) => {
          const cat = categoryMap.get(n.id);
          const filteredByCategory = cat ? !activeCategories.has(cat) : false;
          let dimmed = filteredByCategory || !connectedIds.has(n.id);
          if (!filteredByCategory && !dimmed && showAvailable) {
            dimmed = !availableIds.has(n.id) && !connectedIds.has(n.id);
          }
          return {
            ...n,
            data: {
              ...n.data,
              highlighted: n.id === nodeId,
              dimmed: filteredByCategory || !connectedIds.has(n.id),
            },
          };
        }),
      );

      setEdges((eds) =>
        eds.map((e) => {
          const isConnected = connectedIds.has(e.source) && connectedIds.has(e.target);
          const srcCat = categoryMap.get(e.source);
          const tgtCat = categoryMap.get(e.target);
          const bothVisible =
            (srcCat ? activeCategories.has(srcCat) : true) &&
            (tgtCat ? activeCategories.has(tgtCat) : true);
          return {
            ...e,
            style: {
              ...e.style,
              opacity: isConnected && bothVisible ? 1 : 0.06,
              strokeWidth: isConnected && bothVisible ? 2.5 : 1,
            },
            animated: isConnected && bothVisible && (allPrereqs.has(e.source) || e.source === nodeId),
          };
        }),
      );
    },
    [coursePrereqs, courseDependents, setNodes, setEdges, initialEdges, categoryMap, activeCategories, showAvailable, availableIds],
  );

  const applyFilter = useCallback(
    (cats: Set<CourseCategory>) => {
      setNodes((nds) =>
        nds.map((n) => {
          const cat = categoryMap.get(n.id);
          const catVisible = cat ? cats.has(cat) : true;
          let dimmed = !catVisible;
          if (catVisible && showAvailable) {
            dimmed = !availableIds.has(n.id);
          }
          return {
            ...n,
            data: { ...n.data, dimmed },
            hidden: false,
          };
        }),
      );
      setEdges((eds) =>
        eds.map((e) => {
          const srcCat = categoryMap.get(e.source);
          const tgtCat = categoryMap.get(e.target);
          const bothCatVisible =
            (srcCat ? cats.has(srcCat) : true) && (tgtCat ? cats.has(tgtCat) : true);
          let visible = bothCatVisible;
          if (visible && showAvailable) {
            visible = availableIds.has(e.source) && availableIds.has(e.target);
          }
          return {
            ...e,
            style: {
              ...e.style,
              opacity: visible ? (e.style?.opacity ?? 0.25) : 0.03,
            },
          };
        }),
      );
    },
    [categoryMap, setNodes, setEdges, showAvailable, availableIds],
  );

  const handleCategoryToggle = useCallback(
    (category: CourseCategory) => {
      setActiveCategories((prev) => {
        const next = new Set(prev);
        if (next.has(category)) {
          // Don't allow deactivating all categories
          if (next.size > 1) next.delete(category);
        } else {
          next.add(category);
        }
        // Clear selection when filtering
        setSelectedId(null);
        highlightConnections(null);
        // Apply filter after a tick to let highlight reset
        setTimeout(() => applyFilter(next), 0);
        return next;
      });
    },
    [applyFilter, highlightConnections],
  );

  const handleToggleAvailable = useCallback(() => {
    setShowAvailable((prev) => {
      const next = !prev;
      if (next) {
        // First-time toast
        try {
          if (!localStorage.getItem('roadmap-available-hint-seen')) {
            localStorage.setItem('roadmap-available-hint-seen', 'true');
            setShowToast(true);
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            toastTimerRef.current = setTimeout(() => setShowToast(false), 6000);
          }
        } catch { /* ignore */ }
      }
      return next;
    });
    // Clear selection
    setSelectedId(null);
  }, []);

  // Clean up toast timer
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

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

  // Compute missing prereqs for the selected course (for available view)
  const missingPrereqs = useMemo(() => {
    if (!showAvailable || !selectedCourse || completedIds.has(selectedCourse.id)) return null;
    const prereqs = selectedCourse.prerequisites ?? [];
    const missing = prereqs.filter((pid) => !completedIds.has(pid));
    if (missing.length === 0) return null;
    return missing
      .map((pid) => department.courses.find((c) => c.id === pid)?.name)
      .filter(Boolean) as string[];
  }, [showAvailable, selectedCourse, completedIds, department.courses]);

  return (
    <div
      key={department.id}
      ref={containerRef}
      className="relative w-full bg-gray-50 dark:bg-gray-900"
      style={{ height: 'calc(100vh - 56px)', minHeight: '500px' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        edgesReconnectable={false}
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
        <MapControls containerRef={containerRef} />
      </ReactFlow>

      {/* Legend / filter — top right, horizontally scrollable on mobile */}
      <div data-tour="legend" className="absolute top-2 right-2 sm:top-3 sm:right-3 left-12 sm:left-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 shadow-md border border-gray-200 dark:border-gray-700 z-10 overflow-x-auto">
        <Legend
          activeCategories={activeCategories}
          onToggle={handleCategoryToggle}
          showAvailable={showAvailable}
          onToggleAvailable={handleToggleAvailable}
        />
      </div>

      {/* First-time toast */}
      {showToast && (
        <div
          className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-20 bg-green-50 dark:bg-green-900/60 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-lg backdrop-blur-sm max-w-[90vw] sm:max-w-md text-center animate-fade-in"
          onClick={() => setShowToast(false)}
          role="status"
        >
          دروس رنگی قابل اخذ هستند. دروس خاکستری پیشنیاز ناقص دارند یا قبلا گذرانده شده‌اند.
        </div>
      )}

      {/* Course detail panel — bottom sheet on mobile, top-left card on desktop */}
      {selectedCourse && (
        <div className="absolute inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-auto sm:top-3 sm:right-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700/80 z-10 sm:w-[340px] max-h-[50vh] sm:max-h-[70vh] overflow-y-auto overflow-x-hidden">
          {/* Category accent bar */}
          <div className={`h-1.5 rounded-t-2xl ${
            { base: 'bg-blue-400', specialized: 'bg-rose-400', elective: 'bg-amber-400', special: 'bg-purple-400' }[selectedCourse.category]
          }`} />

          <div className="px-5 pt-4 pb-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <h3 className="font-bold text-base leading-snug text-gray-900 dark:text-gray-100">
                {selectedCourse.name}
              </h3>
              <button
                onClick={() => {
                  setSelectedId(null);
                  highlightConnections(null);
                }}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                { base: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
                  specialized: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
                  elective: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
                  special: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
                }[selectedCourse.category]
              }`}>
                {{ base: 'پایه', specialized: 'تخصصی', elective: 'اختیاری', special: 'خاص' }[selectedCourse.category]}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {toPersianDigits(selectedCourse.credits)} واحد
              </span>
            </div>

            {/* Content sections */}
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              {selectedPrereqNames && selectedPrereqNames.length > 0 && (
                <div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs mb-1.5 uppercase tracking-wide">پیشنیازها</div>
                  <ul className="space-y-1 mr-0.5">
                    {selectedCourse.prerequisites!.map((pid) => {
                      const name = department.courses.find((c) => c.id === pid)?.name;
                      if (!name) return null;
                      const isMissing = missingPrereqs?.includes(name);
                      return (
                        <li key={pid} className={`flex items-center gap-2 text-[13px] ${isMissing ? 'text-red-500 dark:text-red-400 font-semibold' : ''}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isMissing ? 'bg-red-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
                          {name}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {missingPrereqs && missingPrereqs.length > 0 && (
                <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                  <span className="font-bold">پیشنیازهای ناقص</span>
                </div>
              )}
              {selectedDependentNames.length > 0 && (
                <div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs mb-1.5 uppercase tracking-wide">وابسته‌ها</div>
                  <ul className="space-y-1 mr-0.5">
                    {selectedDependentNames.map((name) => (
                      <li key={name} className="flex items-center gap-2 text-[13px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedCourse.corequisites && selectedCourse.corequisites.length > 0 && (
                <div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs mb-1.5 uppercase tracking-wide">همنیاز</div>
                  <div className="text-[13px]">
                    {selectedCourse.corequisites
                      .map((cid) => department.courses.find((c) => c.id === cid)?.name)
                      .filter(Boolean)
                      .join('، ')}
                  </div>
                </div>
              )}
            </div>

            {/* Action button */}
            <button
              onClick={() => toggleCompleted(selectedCourse.id)}
              className={`mt-5 w-full py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                completedIds.has(selectedCourse.id)
                  ? 'bg-green-500 dark:bg-green-600 text-white shadow-sm hover:bg-green-600 dark:hover:bg-green-700 active:scale-[0.98]'
                  : 'bg-primary-500 dark:bg-primary-600 text-white shadow-sm hover:bg-primary-600 dark:hover:bg-primary-700 active:scale-[0.98]'
              }`}
            >
              {completedIds.has(selectedCourse.id) ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  گذرانده شد
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  گذرانده‌ام
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
