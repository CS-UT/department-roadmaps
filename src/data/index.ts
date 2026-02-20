import yaml from 'js-yaml';
import type { CourseCategory, DepartmentData } from './types';

export type { CourseCategory, CourseData, DepartmentData } from './types';

interface RawRoadmap {
  id: string;
  name: string;
  label: string;
  pdf?: string;
  courses: Array<{
    id: string;
    name: string;
    credits: number;
    category: CourseCategory;
    prerequisites?: string[];
    corequisites?: string[];
  }>;
}

const rawFiles = import.meta.glob('./roadmaps/*.yaml', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

const parsed: RawRoadmap[] = Object.values(rawFiles).map(
  (raw) => yaml.load(raw) as RawRoadmap,
);

export const departments: Record<string, DepartmentData> = {};
export const departmentList: Array<{ id: string; label: string; file?: string }> = [];

for (const dept of parsed) {
  departments[dept.id] = {
    id: dept.id,
    name: dept.name,
    courses: dept.courses,
  };
  departmentList.push({
    id: dept.id,
    label: dept.label,
    ...(dept.pdf ? { file: dept.pdf } : {}),
  });
}
