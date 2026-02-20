import type { Node, Edge } from '@xyflow/react';
import type { DepartmentData, CourseData } from '../data/types';
import type { CourseNodeData } from './CourseNode';

const NODE_W = 152;
const NODE_H = 48;
const GAP_X = 18;
const GAP_Y = 72;
const SUB_GAP_Y = 28;
const MAX_COLS = 9;

const CATEGORY_ORDER: Record<string, number> = {
  base: 0,
  specialized: 1,
  elective: 2,
  special: 3,
};

function computeDepths(courses: CourseData[]): Map<string, number> {
  const courseIds = new Set(courses.map((c) => c.id));
  const depths = new Map<string, number>();
  const courseMap = new Map<string, CourseData>();
  for (const c of courses) courseMap.set(c.id, c);

  function getDepth(id: string, visiting: Set<string>): number {
    if (depths.has(id)) return depths.get(id)!;
    if (visiting.has(id)) return 0;
    visiting.add(id);

    const course = courseMap.get(id);
    if (!course) return 0;

    const prereqs = (course.prerequisites ?? []).filter((pid) => courseIds.has(pid));
    if (prereqs.length === 0) {
      depths.set(id, 0);
      return 0;
    }

    const maxPrereqDepth = Math.max(...prereqs.map((pid) => getDepth(pid, visiting)));
    const d = maxPrereqDepth + 1;
    depths.set(id, d);
    return d;
  }

  for (const c of courses) {
    if (!depths.has(c.id)) getDepth(c.id, new Set());
  }

  // Place corequisite-only courses at the same depth as their corequisite partner
  for (const c of courses) {
    if (c.corequisites && c.corequisites.length > 0 && (!c.prerequisites || c.prerequisites.length === 0)) {
      const coreqDepths = c.corequisites
        .filter((cid) => courseIds.has(cid))
        .map((cid) => depths.get(cid) ?? 0);
      if (coreqDepths.length > 0) {
        depths.set(c.id, Math.max(...coreqDepths));
      }
    }
  }

  return depths;
}

function hasDependents(courseId: string, courses: CourseData[]): boolean {
  return courses.some(
    (c) => c.prerequisites?.includes(courseId) || c.corequisites?.includes(courseId),
  );
}

export function buildGraph(dept: DepartmentData): { nodes: Node[]; edges: Edge[] } {
  const courseMap = new Map<string, CourseData>();
  for (const c of dept.courses) courseMap.set(c.id, c);

  const depths = computeDepths(dept.courses);

  // Separate isolated courses (no prereqs, no coreqs, AND no dependents)
  const isolated: CourseData[] = [];
  const connected: CourseData[] = [];

  for (const course of dept.courses) {
    const hasPrereqs = course.prerequisites && course.prerequisites.length > 0;
    const hasCoreqs = course.corequisites && course.corequisites.length > 0;
    const hasDeps = hasDependents(course.id, dept.courses);

    if (!hasPrereqs && !hasCoreqs && !hasDeps) {
      isolated.push(course);
    } else {
      connected.push(course);
    }
  }

  // Group connected courses by depth
  const maxDepth = connected.length > 0
    ? Math.max(...connected.map((c) => depths.get(c.id) ?? 0))
    : 0;
  const levels: CourseData[][] = Array.from({ length: maxDepth + 1 }, () => []);
  for (const course of connected) {
    const d = depths.get(course.id) ?? 0;
    levels[d].push(course);
  }

  // Sort each level: category order, then alphabetical
  for (const level of levels) {
    level.sort((a, b) => {
      const catDiff = (CATEGORY_ORDER[a.category] ?? 9) - (CATEGORY_ORDER[b.category] ?? 9);
      if (catDiff !== 0) return catDiff;
      return a.name.localeCompare(b.name, 'fa');
    });
  }

  // Append isolated courses as the last level
  if (isolated.length > 0) {
    isolated.sort((a, b) => {
      const catDiff = (CATEGORY_ORDER[a.category] ?? 9) - (CATEGORY_ORDER[b.category] ?? 9);
      if (catDiff !== 0) return catDiff;
      return a.name.localeCompare(b.name, 'fa');
    });
    levels.push(isolated);
  }

  // Calculate max row width for centering
  let maxRowWidth = 0;
  for (const level of levels) {
    const cols = Math.min(level.length, MAX_COLS);
    const w = cols * NODE_W + (cols - 1) * GAP_X;
    maxRowWidth = Math.max(maxRowWidth, w);
  }

  // Position nodes in a grid
  const nodes: Node[] = [];
  let y = 0;

  for (let li = 0; li < levels.length; li++) {
    const level = levels[li];
    if (level.length === 0) continue;

    const totalSubRows = Math.ceil(level.length / MAX_COLS);

    for (let subRow = 0; subRow < totalSubRows; subRow++) {
      const rowCourses = level.slice(subRow * MAX_COLS, (subRow + 1) * MAX_COLS);
      const rowWidth = rowCourses.length * NODE_W + (rowCourses.length - 1) * GAP_X;
      const offsetX = (maxRowWidth - rowWidth) / 2;

      for (let col = 0; col < rowCourses.length; col++) {
        const course = rowCourses[col];
        nodes.push({
          id: course.id,
          type: 'course',
          position: {
            x: offsetX + col * (NODE_W + GAP_X),
            y,
          },
          data: {
            label: course.name,
            credits: course.credits,
            category: course.category,
          },
        } as Node<CourseNodeData>);
      }

      y += NODE_H + (subRow < totalSubRows - 1 ? SUB_GAP_Y : 0);
    }

    y += GAP_Y;
  }

  // Create edges
  const edges: Edge[] = [];
  for (const course of dept.courses) {
    if (course.prerequisites) {
      for (const preId of course.prerequisites) {
        if (courseMap.has(preId)) {
          const isElective = course.category === 'elective';
          edges.push({
            id: `e-${preId}-${course.id}`,
            source: preId,
            target: course.id,
            type: 'default',
            animated: false,
            style: {
              stroke: isElective ? '#f59e0b' : '#94a3b8',
              strokeWidth: isElective ? 0.8 : 1.2,
              opacity: isElective ? 0.18 : 0.25,
              pointerEvents: 'none' as const,
            },
          });
        }
      }
    }
    if (course.corequisites) {
      for (const coId of course.corequisites) {
        if (courseMap.has(coId)) {
          edges.push({
            id: `e-coreq-${coId}-${course.id}`,
            source: coId,
            target: course.id,
            type: 'default',
            animated: false,
            style: { stroke: '#22c55e', strokeWidth: 1, strokeDasharray: '5 5', opacity: 0.25, pointerEvents: 'none' as const },
          });
        }
      }
    }
  }

  return { nodes, edges };
}
