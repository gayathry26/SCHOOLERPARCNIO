'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  FileText,
  Download,
  Plus,
  Lock,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatters';
import { ClassSectionManagementStudio } from '@/components/academics/ClassSectionManagementStudio';

export const AcademicsClient: React.FC<{
  academicYears: any[];
  classes: any[];
  subjects: any[];
  studyMaterials: any[];
  teachers?: any[];
  userRole?: string;
}> = ({ academicYears, classes, subjects, studyMaterials, teachers = [], userRole = 'SCHOOL_ADMIN' }) => {
  const [activeTab, setActiveTab] = useState('classes');

  const tabs: TabItem[] = [
    { id: 'classes', label: 'Classes & Sections', count: classes.length, icon: <Layers className="w-4 h-4" /> },
    { id: 'subjects', label: 'Subject Curriculum', count: subjects.length, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'materials', label: 'Study Materials & Syllabus', count: studyMaterials.length, icon: <FileText className="w-4 h-4" /> },
    { id: 'years', label: 'Academic Sessions', count: academicYears.length, icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#171717] tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#990000]" />
            <span>Academic Management &amp; Centralized Class Architecture</span>
          </h2>
          <p className="text-xs text-[#525252] mt-1">
            Unlimited classes, section capacity, Class Advisor assignments, faculty subject allocations, and student promotions.
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ---------------------------------------------------- */}
      {/* TAB 1: CENTRALIZED CLASSES & SECTIONS STUDIO */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'classes' && (
        <ClassSectionManagementStudio
          initialClasses={classes}
          academicYears={academicYears}
          teachers={teachers}
          userRole={userRole}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: SUBJECTS & FACULTY ALLOCATION */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'subjects' && (
        <Card>
          <CardHeader>
            <CardTitle>NCERT &amp; CBSE Subject Curriculum</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Subject Name</th>
                  <th className="p-3">Subject Code</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Assigned Faculty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{sub.name}</td>
                    <td className="p-3 font-mono text-slate-600">{sub.code}</td>
                    <td className="p-3 font-medium text-slate-800">{sub.class?.name}</td>
                    <td className="p-3">
                      <Badge variant={sub.type === 'COMBINED' ? 'emerald' : 'blue'}>{sub.type}</Badge>
                    </td>
                    <td className="p-3 font-medium text-slate-700">
                      {sub.teacherSubjects?.[0]?.teacher?.user
                        ? `${sub.teacherSubjects[0].teacher.user.firstName} ${sub.teacherSubjects[0].teacher.user.lastName}`
                        : 'Senior Faculty'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: STUDY MATERIALS & DIGITAL SYLLABUS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    NCERT Mathematics Class 10 — Heights &amp; Trigonometry
                  </h4>
                  <p className="text-[11px] text-slate-500">Subject: Mathematics • PDF Format • 4.2 MB</p>
                </div>
              </div>
              <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                Download
              </Button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete chapter notes, solved trigonometric formula derivations, and past 10-year CBSE board questions.
            </p>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Physics Lab Manual &amp; Optics Ray Diagrams
                  </h4>
                  <p className="text-[11px] text-slate-500">Subject: Science &amp; Tech • PDF Format • 6.8 MB</p>
                </div>
              </div>
              <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                Download
              </Button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Step-by-step practical experiment procedures, lens formula verification, and circuit diagram guides.
            </p>
          </Card>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: ACADEMIC SESSIONS & YEAR ISOLATION */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'years' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Academic Sessions &amp; Year Isolation Ledger</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Past session records are securely locked to prevent accidental overwrite
              </p>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {academicYears.map((ay) => (
              <div
                key={ay.id}
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  ay.isCurrent
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{ay.name}</h4>
                    {ay.isCurrent && <Badge variant="emerald">Active Current Session</Badge>}
                    {ay.isLocked && <Badge variant="rose">Locked Historical Session</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Duration: {formatDate(ay.startDate)} to {formatDate(ay.endDate)}
                  </p>
                </div>

                <div className="text-right text-xs">
                  {ay.isLocked ? (
                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                      <Lock className="w-3.5 h-3.5 text-slate-400" /> Read-Only Historical
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Open for Enrollments
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
