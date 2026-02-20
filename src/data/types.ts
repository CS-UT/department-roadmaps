export type CourseCategory = 'base' | 'specialized' | 'elective' | 'special';

export interface CourseData {
  id: string;
  name: string;
  credits: number;
  category: CourseCategory;
  prerequisites?: string[];
  corequisites?: string[];
}

export interface DepartmentData {
  id: string;
  name: string;
  courses: CourseData[];
}
