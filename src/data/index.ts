import { csDepartment } from './cs';
import { statsDepartment } from './stats';
import { mathDepartment } from './math';
import type { DepartmentData } from './types';

export type { CourseCategory, CourseData, DepartmentData } from './types';

export const departments: Record<string, DepartmentData> = {
  cs: csDepartment,
  stats: statsDepartment,
  math: mathDepartment,
};

export const departmentList = [
  { id: 'cs', label: 'علوم کامپیوتر', file: '/CS-UT-V3.pdf' },
  { id: 'stats', label: 'آمار', file: '/Statistic-UT-V1.pdf' },
  { id: 'math', label: 'ریاضیات و کاربردها', file: '/Math-UT-V4.pdf' },
] as const;
