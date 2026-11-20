'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  User,
  GraduationCap,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const AdmissionEnquiryCard: React.FC = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    gender: 'MALE',
    applyingForClass: 'Grade 10',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successApplication, setSuccessApplication] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Basic Validation
    if (!formData.studentName.trim()) {
      setErrorMessage('Please enter the student full name');
      return;
    }
    if (!formData.parentName.trim()) {
      setErrorMessage('Please enter the parent/guardian name');
      return;
    }
    const cleanPhone = formData.parentPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: formData.studentName.trim(),
          gender: formData.gender,
          applyingForClass: formData.applyingForClass,
          parentName: formData.parentName.trim(),
          parentPhone: formData.parentPhone.trim(),
          parentEmail: formData.parentEmail.trim() || undefined,
          address: formData.address.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.application) {
        setSuccessApplication(data.application);
      } else {
        setErrorMessage(data.error || 'Failed to submit admission enquiry. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while submitting. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessApplication(null);
    setFormData({
      studentName: '',
      gender: 'MALE',
      applyingForClass: 'Grade 10',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      address: '',
    });
  };

  return (
    <div id="admissions" className="bg-white border border-[#E4EAEC] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
      {/* Decorative accent edge */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#086A92] via-[#008C91] to-[#35B84A]" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E4EAEC] gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EAF8EC] text-[#16A34A]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#17313A]">
              Online Admission Enquiry
            </h3>
          </div>
          <p className="text-xs text-[#6B7C83] mt-0.5">
            Academic Session 2026–2027 • Senior Secondary CBSE Affiliation #89410
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF8EC] text-[#16A34A] text-xs font-bold border border-[#bbf0c5] shrink-0 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-[#35B84A] animate-pulse" />
          <span>Seats Open</span>
        </span>
      </div>

      {/* SUCCESS STATE */}
      {successApplication ? (
        <div className="py-8 space-y-4 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 bg-[#EAF8EC] text-[#16A34A] rounded-full flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-bold text-[#17313A]">
              Enquiry Submitted Successfully!
            </h4>
            <p className="text-xs text-[#6B7C83] max-w-md mx-auto">
              Thank you for choosing Edvonest Model International Academy. Your provisional application file has been registered.
            </p>
          </div>

          <div className="bg-[#F7FAFA] border border-[#E4EAEC] rounded-2xl p-4 max-w-sm mx-auto text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Application Ref #:</span>
              <span className="font-mono font-bold text-[#086A92] text-sm">
                {successApplication.applicationNo}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Student Name:</span>
              <span className="font-bold text-[#17313A]">{successApplication.studentName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Class Applying:</span>
              <span className="font-semibold text-slate-700">{successApplication.applyingForClass}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Status:</span>
              <span className="text-[10.5px] font-bold bg-[#EAF8EC] text-[#16A34A] px-2 py-0.5 rounded">
                Under Review
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Our Academic Admissions Counselor will contact{' '}
            <strong className="text-slate-800">{successApplication.parentPhone}</strong> within 24 working hours.
          </p>

          <Button variant="outline" size="sm" onClick={handleReset} className="mt-2 text-xs">
            Submit Another Enquiry
          </Button>
        </div>
      ) : (
        /* FORM STATE */
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Student Name & Class */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label className="block font-bold text-[#17313A] mb-1.5">
                Student Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#E4EAEC] rounded-xl text-[#17313A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#086A92]/20 focus:border-[#086A92] transition-all"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="block font-bold text-[#17313A] mb-1.5">
                Class Applying For *
              </label>
              <select
                value={formData.applyingForClass}
                onChange={(e) => setFormData({ ...formData, applyingForClass: e.target.value })}
                className="w-full px-3 py-2.5 text-xs bg-white border border-[#E4EAEC] rounded-xl text-[#17313A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#086A92]/20 focus:border-[#086A92] transition-all"
              >
                <option value="Pre-Primary">Pre-Primary (Kindergarten)</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11 (Science PCM)">Grade 11 (Science PCM)</option>
                <option value="Grade 11 (Science PCB)">Grade 11 (Science PCB)</option>
                <option value="Grade 11 (Commerce)">Grade 11 (Commerce)</option>
                <option value="Grade 11 (Humanities)">Grade 11 (Humanities)</option>
              </select>
            </div>
          </div>

          {/* Parent Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#17313A] mb-1.5">
                Parent / Guardian Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Sharma"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3 py-2.5 text-xs bg-white border border-[#E4EAEC] rounded-xl text-[#17313A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#086A92]/20 focus:border-[#086A92] transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-[#17313A] mb-1.5">
                Parent Mobile Phone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98XXX XXXXX"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#E4EAEC] rounded-xl text-[#17313A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#086A92]/20 focus:border-[#086A92] transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* Parent Email & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#17313A] mb-1.5">
                Parent Email (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="parent.contact@gmail.com"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#E4EAEC] rounded-xl text-[#17313A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#086A92]/20 focus:border-[#086A92] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#17313A] mb-1.5">
                City / Locality (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Sector 62, Noida"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2.5 text-xs bg-white border border-[#E4EAEC] rounded-xl text-[#17313A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#086A92]/20 focus:border-[#086A92] transition-all"
              />
            </div>
          </div>

          {/* Submit Action & Security Badge */}
          <div className="pt-2 space-y-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-md cursor-pointer"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Submit Official Admission Enquiry
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-[#6B7C83]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>256-bit encrypted submission. Zero public caching of sensitive records.</span>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
