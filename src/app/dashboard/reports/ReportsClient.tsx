'use client';

import React from 'react';
import {
  BarChart3,
  Download,
  GraduationCap,
  CalendarCheck,
  DollarSign,
  FileCheck2,
  Users,
  Bus,
  Library,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { showToast } from '@/components/ui/Toast';
import { exportToCSV } from '@/lib/export';

export const ReportsClient: React.FC<{
  students: any[];
  attendance: any[];
  invoices: any[];
  marks: any[];
  staff: any[];
}> = ({ students, attendance, invoices, marks, staff }) => {
  const exportStudentsReport = () => {
    const data = students.map((s) => ({
      'Admission Number': s.admissionNumber,
      'Roll Number': s.rollNumber,
      'Student Name': `${s.user.firstName} ${s.user.lastName}`,
      Gender: s.gender,
      'Date of Birth': s.dob ? new Date(s.dob).toISOString().slice(0, 10) : '',
      'Blood Group': s.bloodGroup,
      Class: s.enrollments[0]?.class?.name,
      Section: s.enrollments[0]?.section?.name,
      'Parent Contact': s.emergencyContact,
      House: s.house,
    }));
    exportToCSV(data, 'EDVONEST_Student_Enrollment_Master_Report');
    showToast(`Exported ${data.length} student records to CSV`, 'success');
  };

  const exportFeesReport = () => {
    const data = invoices.map((inv) => ({
      'Invoice Number': inv.invoiceNumber,
      'Student Name': `${inv.student.user.firstName} ${inv.student.user.lastName}`,
      'Fee Title': inv.title,
      'Due Date': inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0, 10) : '',
      'Total Amount (₹)': inv.totalAmount,
      'Paid Amount (₹)': inv.paidAmount,
      'Balance Due (₹)': inv.totalAmount - inv.paidAmount,
      Status: inv.status,
    }));
    exportToCSV(data, 'EDVONEST_Fee_Collection_and_Dues_Report');
    showToast(`Exported ${data.length} fee ledger records to CSV`, 'success');
  };

  const exportAttendanceReport = () => {
    const data = attendance.map((att) => ({
      Date: att.date ? new Date(att.date).toISOString().slice(0, 10) : '',
      'Student Name': `${att.student.user.firstName} ${att.student.user.lastName}`,
      'Admission No': att.student.admissionNumber,
      Status: att.status,
      Remarks: att.remarks || 'Regular',
    }));
    exportToCSV(data, 'EDVONEST_Attendance_Compliance_Report');
    showToast(`Exported ${data.length} attendance records to CSV`, 'success');
  };

  const exportExamsReport = () => {
    const data = marks.map((m) => ({
      Exam: m.examSchedule?.exam?.name,
      Subject: m.examSchedule?.subject?.name,
      'Student Name': `${m.student.user.firstName} ${m.student.user.lastName}`,
      'Theory Marks': m.theoryMarks,
      'Practical Marks': m.practicalMarks,
      'Total Marks': m.theoryMarks + m.practicalMarks,
      Remarks: m.remarks || '',
    }));
    exportToCSV(data, 'EDVONEST_Academic_Exam_Performance_Report');
    showToast(`Exported ${data.length} exam marks records to CSV`, 'success');
  };

  const exportStaffReport = () => {
    const data = staff.map((st) => ({
      'Employee Code': st.employeeCode || 'EMP-01',
      Name: `${st.user.firstName} ${st.user.lastName}`,
      Designation: st.designation || 'Staff',
      Department: st.department?.name || 'Academic',
      Phone: st.phone,
    }));
    exportToCSV(data, 'EDVONEST_Staff_Directory_Report');
    showToast(`Exported ${data.length} staff records to CSV`, 'success');
  };

  const categories = [
    {
      title: 'Student Reports',
      desc: 'Enrollment registers, demographic distributions, and house listings',
      icon: GraduationCap,
      color: 'bg-[#FEF2F2] text-[#990000]',
      count: `${students.length} Students`,
      onExport: exportStudentsReport,
    },
    {
      title: 'Attendance Reports',
      desc: 'Daily logs, monthly summaries, and CBSE 75% threshold compliance',
      icon: CalendarCheck,
      color: 'bg-[#EAF8EC] text-[#16A34A]',
      count: `${attendance.length} Logs`,
      onExport: exportAttendanceReport,
    },
    {
      title: 'Fee & Finance Reports',
      desc: 'Invoices, collected totals, balance dues, and receipt ledgers',
      icon: DollarSign,
      color: 'bg-[#FEF3C7] text-[#B45309]',
      count: `${invoices.length} Invoices`,
      onExport: exportFeesReport,
    },
    {
      title: 'Academic & Exam Reports',
      desc: 'Marksheets, subject performance averages, and term rankings',
      icon: FileCheck2,
      color: 'bg-[#FEF2F2] text-[#C00000]',
      count: `${marks.length} Records`,
      onExport: exportExamsReport,
    },
    {
      title: 'Staff & HR Reports',
      desc: 'Faculty directories, department allocations, and employee codes',
      icon: Users,
      color: 'bg-[#F1F5F7] text-[#171717]',
      count: `${staff.length} Staff`,
      onExport: exportStaffReport,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-2xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#171717] tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#990000]" />
            <span>Categorized School Reports Hub</span>
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Download clean, organized CSV spreadsheets categorized by module.
          </p>
        </div>
      </div>

      {/* Categorized Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card key={cat.title} hoverEffect className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${cat.color} shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#171717] text-sm">{cat.title}</h3>
                      <span className="text-[10px] text-[#737373] font-semibold">{cat.count}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#737373] leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex justify-end">
                <Button
                  variant="primary"
                  size="xs"
                  onClick={cat.onExport}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download CSV
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
