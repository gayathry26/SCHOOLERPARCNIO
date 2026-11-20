'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  UserCheck,
  GraduationCap,
  BookOpen,
  DollarSign,
  Users,
  User,
  HeartHandshake,
  Bus,
  Library,
  ChevronDown,
  Sparkles,
  HeartPulse,
  Compass,
  Headphones,
  FileCheck2,
} from 'lucide-react';

export const ROLES_LIST = [
  { id: 'SCHOOL_ADMIN', label: 'School Admin', icon: UserCheck, desc: 'Full School Operations & Controls', email: 'admin@edvonest.com' },
  { id: 'PRINCIPAL', label: 'Principal', icon: GraduationCap, desc: 'Academic & School Oversight', email: 'principal@edvonest.com' },
  { id: 'VICE_PRINCIPAL', label: 'Vice Principal', icon: GraduationCap, desc: 'Curriculum & Discipline', email: 'viceprincipal@edvonest.com' },
  { id: 'TEACHER', label: 'Teacher (Math)', icon: BookOpen, desc: 'Attendance, Marks, Timetable', email: 'teacher.math@edvonest.com' },
  { id: 'CLASS_TEACHER', label: 'Class Teacher (Science)', icon: BookOpen, desc: 'Section 10-B Mentor', email: 'teacher.science@edvonest.com' },
  { id: 'ACCOUNTANT', label: 'Accountant', icon: DollarSign, desc: 'Fee Collection, Vouchers', email: 'accountant@edvonest.com' },
  { id: 'HR_MANAGER', label: 'HR Manager', icon: Users, desc: 'Staff, Leaves & Payroll', email: 'hr@edvonest.com' },
  { id: 'STUDENT', label: 'Student (Aarav)', icon: User, desc: 'Class 10-A, Roll 01', email: 'student1@edvonest.com' },
  { id: 'PARENT', label: 'Parent (Amit)', icon: HeartHandshake, desc: 'Fee Pay, Child Tracking', email: 'parent1@edvonest.com' },
  { id: 'TRANSPORT_MANAGER', label: 'Transport Manager', icon: Bus, desc: 'Fleet Operations & Safety', email: 'transport.manager@edvonest.com' },
  { id: 'TRANSPORT_STAFF', label: 'Transport / Driver', icon: Bus, desc: 'Bus Routes, Stops & Fleets', email: 'transport@edvonest.com' },
  { id: 'LIBRARIAN', label: 'Librarian', icon: Library, desc: 'Book Catalog, Issue/Return', email: 'librarian@edvonest.com' },
  { id: 'COUNSELLOR', label: 'Counsellor', icon: Headphones, desc: 'Student Wellbeing & Career', email: 'counsellor@edvonest.com' },
  { id: 'NURSE', label: 'School Nurse', icon: HeartPulse, desc: 'Health Clinic & First Aid', email: 'nurse@edvonest.com' },
  { id: 'RECEPTIONIST', label: 'Receptionist', icon: Compass, desc: 'Front Desk & Visitor Passes', email: 'reception@edvonest.com' },
  { id: 'SUPER_ADMIN', label: 'Super Admin', icon: ShieldAlert, desc: 'Multi-Tenant Platform Owner', email: 'superadmin@edvonest.com' },
];

export const RoleSwitcher: React.FC<{ currentRole: string; currentUserName?: string }> = ({
  currentRole,
  currentUserName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const router = useRouter();

  const activeRoleObj = ROLES_LIST.find((r) => r.id === currentRole) || ROLES_LIST[0];
  const IconComponent = activeRoleObj.icon;

  const handleSwitch = async (roleId: string) => {
    setIsSwitching(true);
    setIsOpen(false);
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: roleId }),
      });
      if (res.ok) {
        router.refresh();
        window.location.href = '/dashboard';
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-[#F7FAFA] hover:bg-[#EAF5F8] border border-[#E4EAEC] rounded-lg text-xs font-semibold text-[#17313A] transition-all cursor-pointer"
        title="Switch user role to test permissions"
      >
        <div className="flex items-center gap-1.5">
          <IconComponent className="w-3.5 h-3.5 text-[#086A92]" />
          <span className="hidden sm:inline text-[#6B7C83]">Role:</span>
          <span className="text-[#086A92] font-bold">{activeRoleObj.label}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[#6B7C83] transition-transform ${isOpen ? 'rotate-180 text-[#086A92]' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E4EAEC] p-2 z-50 animate-in fade-in-50 zoom-in-95">
          <div className="p-2 border-b border-[#E4EAEC] mb-1 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#086A92] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#35B84A]" />
              Role Switcher
            </span>
            <span className="text-[10px] bg-[#EAF5F8] text-[#086A92] px-1.5 py-0.5 rounded font-mono font-bold">
              Test RBAC
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-1">
            {ROLES_LIST.map((role) => {
              const RoleIcon = role.icon;
              const isSelected = role.id === currentRole;
              return (
                <button
                  key={role.id}
                  onClick={() => handleSwitch(role.id)}
                  className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#EAF5F8] border border-[#c0e3ed] text-[#086A92]'
                      : 'hover:bg-[#F7FAFA] text-[#17313A]'
                  }`}
                >
                  <div className={`p-1.5 rounded-md ${isSelected ? 'bg-[#086A92] text-white' : 'bg-[#F1F5F7] text-[#6B7C83]'}`}>
                    <RoleIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-[#086A92]' : 'text-[#17313A]'}`}>
                        {role.label}
                      </p>
                      {isSelected && (
                        <span className="text-[10px] bg-[#35B84A] text-white px-1.5 py-0.2 rounded-full font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] truncate ${isSelected ? 'text-[#008C91]' : 'text-[#6B7C83]'}`}>
                      {role.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
