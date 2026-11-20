import { format } from 'date-fns';

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹ 0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount).replace('INR', '₹');
}

export function formatDate(date: Date | string | null | undefined, fmt: string = 'dd MMM yyyy'): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, fmt);
  } catch (err) {
    return String(date);
  }
}

export function calculateGrade(marks: number, maxMarks: number = 100): { grade: string; gradePoint: number; remark: string } {
  const percentage = (marks / maxMarks) * 100;

  if (percentage >= 91) return { grade: 'A1', gradePoint: 10, remark: 'Outstanding' };
  if (percentage >= 81) return { grade: 'A2', gradePoint: 9, remark: 'Excellent' };
  if (percentage >= 71) return { grade: 'B1', gradePoint: 8, remark: 'Very Good' };
  if (percentage >= 61) return { grade: 'B2', gradePoint: 7, remark: 'Good' };
  if (percentage >= 51) return { grade: 'C1', gradePoint: 6, remark: 'Above Average' };
  if (percentage >= 41) return { grade: 'C2', gradePoint: 5, remark: 'Average' };
  if (percentage >= 33) return { grade: 'D', gradePoint: 4, remark: 'Pass' };
  return { grade: 'E', gradePoint: 0, remark: 'Needs Improvement / Essential Repeat' };
}

export function getStatusBadgeColor(status: string): { bg: string; text: string; border: string } {
  switch (status.toUpperCase()) {
    case 'PAID':
    case 'PRESENT':
    case 'APPROVED':
    case 'ACTIVE':
    case 'SUBMITTED':
    case 'ISSUED':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'PENDING':
    case 'ENQUIRY':
    case 'INTERVIEW_SCHEDULED':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'PARTIALLY_PAID':
    case 'LATE':
    case 'HALF_DAY':
    case 'REVIEWED':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'OVERDUE':
    case 'ABSENT':
    case 'REJECTED':
    case 'DETAINED':
    case 'LOST':
    case 'URGENT':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  }
}
