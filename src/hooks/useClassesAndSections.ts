'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SectionLookupItem {
  id: string;
  name: string;
  fullName: string;
  roomNo?: string;
  capacity: number;
  enrolledCount: number;
  availableSeats: number;
  advisorId?: string | null;
  advisorName: string;
  isTeacherAdvisor?: boolean;
  isTeacherAllocated?: boolean;
}

export interface ClassLookupItem {
  id: string;
  name: string;
  numericOrder: number;
  stream: string;
  isActive: boolean;
  sections: SectionLookupItem[];
}

export function useClassesAndSections() {
  const [classes, setClasses] = useState<ClassLookupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSchoolAdmin, setIsSchoolAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string>('STUDENT');

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/classes?lookup=true');
      if (!res.ok) {
        throw new Error(`Failed to load classes (${res.status})`);
      }
      const data = await res.json();
      setClasses(data.classes || []);
      setIsSchoolAdmin(Boolean(data.isSchoolAdmin));
      setUserRole(data.userRole || 'STUDENT');
    } catch (err: any) {
      console.error('useClassesAndSections fetch error:', err);
      setError(err.message || 'Error fetching classes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const getSectionsForClass = useCallback(
    (classId: string): SectionLookupItem[] => {
      const cls = classes.find((c) => c.id === classId);
      return cls ? cls.sections : [];
    },
    [classes]
  );

  const getClassById = useCallback(
    (classId: string): ClassLookupItem | undefined => {
      return classes.find((c) => c.id === classId);
    },
    [classes]
  );

  const getSectionById = useCallback(
    (sectionId: string): { section: SectionLookupItem; classItem: ClassLookupItem } | null => {
      for (const cls of classes) {
        const sec = cls.sections.find((s) => s.id === sectionId);
        if (sec) {
          return { section: sec, classItem: cls };
        }
      }
      return null;
    },
    [classes]
  );

  // All sections flattened
  const allSections = classes.flatMap((c) => c.sections);

  // Filtered to only sections where current user is assigned as Class Advisor (if teacher)
  const advisorSections = allSections.filter((s) => s.isTeacherAdvisor);

  // Filtered to all sections where current user has any allocation (advisor or subject)
  const authorizedSections = allSections.filter((s) => s.isTeacherAllocated || s.isTeacherAdvisor);

  return {
    classes,
    allSections,
    advisorSections,
    authorizedSections,
    loading,
    error,
    isSchoolAdmin,
    userRole,
    refresh: fetchClasses,
    getSectionsForClass,
    getClassById,
    getSectionById,
  };
}
