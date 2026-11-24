'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  ClipboardList,
  Clock,
  BookOpen,
  DollarSign,
  Bus,
  CheckCircle2,
  Award,
  CreditCard,
  Phone,
  BellRing,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { formatCurrency, formatDate } from '@/lib/formatters';

export interface ParentDashboardProps {
  studentData: any;
  announcements: any[];
}

export const ParentDashboardView: React.FC<ParentDashboardProps> = ({
  studentData,
  announcements,
}) => {
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  const childrenList = [
    {
      name: `${studentData?.user?.firstName || 'Aarav'} ${studentData?.user?.lastName || 'Verma'}`,
      class: 'Class 10 - Section A',
      admissionNo: studentData?.admissionNumber || 'EDV-2025-0101',
      rollNo: studentData?.rollNumber || '01',
      attendance: 94.2,
      feeDue: 12500,
      busRoute: 'Route #4 (North Campus Express)',
      busEta: '10 Mins (En Route)',
      driverName: 'Mr. Ramesh Yadav',
      driverPhone: '+91 98765 43210',
    },
  ];

  const currentChild = childrenList[selectedChildIndex];

  return (
    <div className="space-y-6">
      {/* Child Ward Switcher & Profile Card */}
      <div className="bg-[#990000] text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Avatar
            name={currentChild.name}
            size="xl"
            shape="rounded"
            status="online"
            className="ring-2 ring-white/30 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold">{currentChild.name}</h2>
              <span className="text-[10px] bg-white/20 text-[#FEF2F2] px-2 py-0.5 rounded-full font-bold">
                Student Ward
              </span>
            </div>
            <p className="text-xs text-[#FEF2F2]">
              {currentChild.class} • Admission #{currentChild.admissionNo} • Roll #{currentChild.rollNo}
            </p>
            <p className="text-xs text-[#990000] font-bold mt-0.5">
              Attendance: {currentChild.attendance}% (Eligible for Board Exams)
            </p>
          </div>
        </div>

        {/* 1-Tap Fee Payment Action */}
        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/20">
          <div>
            <p className="text-[10px] text-[#FEF2F2] uppercase tracking-wider font-semibold">Term Fee Balance</p>
            <p className="text-lg font-black text-[#FDE68A]">{formatCurrency(currentChild.feeDue)}</p>
          </div>
          <Link href="/dashboard/fees">
            <Button variant="secondary" size="sm" className="bg-[#990000] text-white hover:bg-[#990000]/90 border-transparent font-bold">
              Pay Online
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Core Parent Vital Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${currentChild.attendance}%`}
          subtitle="Present today in school"
          icon={<CalendarCheck className="w-5 h-5" />}
          variant="green"
        />
        <StatCard
          title="Pending Fees"
          value={formatCurrency(currentChild.feeDue)}
          subtitle="Q3 Tuition &amp; Transport"
          icon={<DollarSign className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Homework Assigned"
          value="3 Tasks"
          subtitle="Math, Science, English"
          icon={<ClipboardList className="w-5 h-5" />}
          variant="blue"
        />
        <StatCard
          title="Live Bus Status"
          value="On Route"
          subtitle="ETA: 10 Mins to Campus"
          icon={<Bus className="w-5 h-5" />}
          variant="teal"
        />
      </div>

      {/* 2-Column Section: Homework & Bus Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Child Homework & Status */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#990000]" />
                <span>Homework &amp; Assignments</span>
              </CardTitle>
              <Link href="/dashboard/homework">
                <Button variant="ghost" size="xs">All Tasks</Button>
              </Link>
            </CardHeader>
            <div className="space-y-2.5">
              <div className="p-3 bg-[#FEF3C7]/40 border border-[#FDE68A] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#171717]">Quadratic Formula Exercises 4.2</h4>
                    <Badge variant="amber" size="xs">Due Tomorrow</Badge>
                  </div>
                  <p className="text-[10px] text-[#737373] mt-0.5">Mathematics • Class 10-A • Assigned by Mr. Verma</p>
                  <p className="text-[10px] text-[#990000] font-semibold mt-1">Teacher Remark: Submit completed notebook in period 1</p>
                </div>
                <Badge variant="amber" size="xs">Pending</Badge>
              </div>

              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#171717]">Light Ray Reflection Diagrams</h4>
                    <Badge variant="green" size="xs">Submitted</Badge>
                  </div>
                  <p className="text-[10px] text-[#737373] mt-0.5">Science Lab • Class 10-A • Submitted on 17 Nov</p>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-1">Teacher Grade: A+ (Well done)</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#990000]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Live School Bus ETA */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-[#C00000]" />
                <span>Live School Transport</span>
              </CardTitle>
              <Link href="/dashboard/transport">
                <Button variant="ghost" size="xs">Live Map</Button>
              </Link>
            </CardHeader>
            <div className="p-3.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#171717]">{currentChild.busRoute}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  GPS Active
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#737373]">
                <span>Current Status</span>
                <span className="font-bold text-[#990000]">{currentChild.busEta}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#737373] border-t border-[#E5E5E5] pt-2">
                <span>Driver: {currentChild.driverName}</span>
                <a
                  href={`tel:${currentChild.driverPhone}`}
                  className="flex items-center gap-1 text-[#990000] font-bold hover:underline"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Driver</span>
                </a>
              </div>
            </div>
          </Card>

          {/* Quick Notice Pill */}
          <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl flex items-center gap-3">
            <HeartHandshake className="w-6 h-6 text-[#990000] shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-[#171717]">Parent-Teacher Meeting</p>
              <p className="text-[11px] text-[#737373]">Upcoming PTM on Saturday, 23 Nov, 09:00 AM.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements & Circulars */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[#990000]" />
            <span>School Circulars &amp; Announcements</span>
          </CardTitle>
          <Link href="/dashboard/communication">
            <Button variant="ghost" size="xs">View All</Button>
          </Link>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {announcements.slice(0, 2).map((ann) => (
            <div key={ann.id} className="p-3 bg-[#F5F5F5] rounded-xl border border-[#E5E5E5] text-xs">
              <div className="flex items-center justify-between text-[10px] text-[#737373]">
                <span className="font-bold text-[#990000]">{ann.targetAudience}</span>
                <span>{formatDate(ann.publishedAt, 'dd MMM')}</span>
              </div>
              <p className="font-bold text-[#171717] mt-1">{ann.title}</p>
              <p className="text-[11px] text-[#737373] mt-0.5 line-clamp-2">{ann.content}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

