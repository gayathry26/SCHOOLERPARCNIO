import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [
      school,
      activeAcademicYear,
      classes,
      subjects,
      teachersCount,
      studentsCount,
      feeStructuresCount,
      timetableCount,
    ] = await Promise.all([
      prisma.school.findFirst(),
      prisma.academicYear.findFirst({ where: { isCurrent: true } }),
      prisma.class.findMany({
        include: { sections: true },
        orderBy: { numericOrder: 'asc' },
      }),
      prisma.subject.findMany({
        include: { class: true },
        orderBy: { name: 'asc' },
      }),
      prisma.teacherProfile.count(),
      prisma.studentProfile.count(),
      prisma.feeStructure.count(),
      prisma.timetableEntry.count(),
    ]);

    // Calculate setup readiness checklist
    const readinessChecklist = {
      profile: Boolean(school?.name && school?.affiliationNo),
      academicYear: Boolean(activeAcademicYear),
      classes: classes.length > 0,
      subjects: subjects.length > 0,
      teachers: teachersCount > 0,
      students: studentsCount > 0,
      fees: feeStructuresCount > 0,
      timetable: timetableCount > 0,
      permissions: true,
    };

    let completedSteps = 0;
    Object.values(readinessChecklist).forEach((v) => {
      if (v) completedSteps++;
    });

    const readinessScore = Math.min(100, Math.round((completedSteps / 9) * 100));

    return NextResponse.json({
      success: true,
      school,
      activeAcademicYear,
      classes,
      subjects,
      counts: {
        classes: classes.length,
        subjects: subjects.length,
        teachers: teachersCount,
        students: studentsCount,
        feeStructures: feeStructuresCount,
        timetable: timetableCount,
      },
      readinessChecklist,
      readinessScore,
      onboardingStatus: school?.onboardingStatus || 'IN_PROGRESS',
    });
  } catch (error: any) {
    console.error('Onboarding GET error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const AUTHORIZED_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'];
    if (!AUTHORIZED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required for school setup' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    const school = await prisma.school.findFirst();
    const schoolId = school?.id || 'edvonest-main-school';

    // ----------------------------------------------------
    // STEP 1: UPDATE_PROFILE
    // ----------------------------------------------------
    if (action === 'UPDATE_PROFILE') {
      const {
        name,
        affiliationNo,
        board,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        currencySymbol,
        currencyCode,
        attendanceThreshold,
        logoUrl,
      } = body;

      if (!name || !affiliationNo) {
        return NextResponse.json({ error: 'School name and affiliation number are required' }, { status: 400 });
      }

      const updated = await prisma.school.update({
        where: { id: schoolId },
        data: {
          name,
          affiliationNo,
          board: board || 'CBSE',
          email: email || undefined,
          phone: phone || undefined,
          address: address || undefined,
          city: city || undefined,
          state: state || undefined,
          pincode: pincode || undefined,
          currencySymbol: currencySymbol || '₹',
          currencyCode: currencyCode || 'INR',
          attendanceThreshold: attendanceThreshold ? parseFloat(attendanceThreshold) : 75.0,
          logoUrl: logoUrl || undefined,
        },
      });

      await logAudit({
        schoolId,
        userId: user.id,
        action: 'UPDATE_SCHOOL_PROFILE',
        module: 'SETTINGS',
        recordId: schoolId,
        newValue: `Updated school profile: ${name} (${board})`,
      });

      return NextResponse.json({ success: true, school: updated });
    }

    // ----------------------------------------------------
    // STEP 2: SETUP_ACADEMIC_YEAR
    // ----------------------------------------------------
    if (action === 'SETUP_ACADEMIC_YEAR') {
      const { name, startDate, endDate, isCurrent } = body;

      if (!name || !startDate || !endDate) {
        return NextResponse.json({ error: 'Session name, start date, and end date are required' }, { status: 400 });
      }

      // If isCurrent, clear other current flags
      if (isCurrent) {
        await prisma.academicYear.updateMany({
          data: { isCurrent: false },
        });
      }

      // Upsert academic year
      const existing = await prisma.academicYear.findFirst({ where: { name } });
      const academicYear = existing
        ? await prisma.academicYear.update({
            where: { id: existing.id },
            data: {
              startDate: new Date(startDate),
              endDate: new Date(endDate),
              isCurrent: Boolean(isCurrent),
              status: isCurrent ? 'ACTIVE' : 'UPCOMING',
            },
          })
        : await prisma.academicYear.create({
            data: {
              name,
              startDate: new Date(startDate),
              endDate: new Date(endDate),
              isCurrent: Boolean(isCurrent),
              status: isCurrent ? 'ACTIVE' : 'UPCOMING',
            },
          });

      await logAudit({
        schoolId,
        userId: user.id,
        action: 'SETUP_ACADEMIC_YEAR',
        module: 'ACADEMICS',
        recordId: academicYear.id,
        newValue: `Configured session: ${name} (${startDate} to ${endDate})`,
      });

      return NextResponse.json({ success: true, academicYear });
    }

    // ----------------------------------------------------
    // STEP 3: SETUP_CLASSES
    // ----------------------------------------------------
    if (action === 'SETUP_CLASSES') {
      const { classesList } = body; // Array of { name: 'Class 10', numericOrder: 10, sections: ['A', 'B'] }

      if (!Array.isArray(classesList) || classesList.length === 0) {
        return NextResponse.json({ error: 'Please provide at least one class' }, { status: 400 });
      }

      const createdClasses = [];

      for (const item of classesList) {
        let cls = await prisma.class.findFirst({ where: { name: item.name } });
        if (!cls) {
          cls = await prisma.class.create({
            data: {
              name: item.name,
              numericOrder: item.numericOrder || item.gradeOrder || 1,
              schoolId,
            },
          });
        }

        const sections = Array.isArray(item.sections) ? item.sections : ['A'];
        for (const secName of sections) {
          const secExisting = await prisma.section.findFirst({
            where: { classId: cls.id, name: secName },
          });
          if (!secExisting) {
            await prisma.section.create({
              data: {
                name: secName,
                classId: cls.id,
                roomNo: `Room ${cls.numericOrder}0${secName}`,
              },
            });
          }
        }

        createdClasses.push(cls);
      }

      await logAudit({
        schoolId,
        userId: user.id,
        action: 'SETUP_CLASSES_AND_SECTIONS',
        module: 'ACADEMICS',
        recordId: schoolId,
        newValue: `Configured ${classesList.length} classes with sections`,
      });

      const updatedClasses = await prisma.class.findMany({
        include: { sections: true },
        orderBy: { numericOrder: 'asc' },
      });

      return NextResponse.json({ success: true, classes: updatedClasses });
    }

    // ----------------------------------------------------
    // STEP 4: SETUP_SUBJECTS
    // ----------------------------------------------------
    if (action === 'SETUP_SUBJECTS') {
      const { subjectsList } = body; // Array of { name, code, classId? }

      if (!Array.isArray(subjectsList) || subjectsList.length === 0) {
        return NextResponse.json({ error: 'Please provide at least one subject' }, { status: 400 });
      }

      const created = [];
      for (const sub of subjectsList) {
        const existing = await prisma.subject.findFirst({
          where: { code: sub.code },
        });

        if (!existing) {
          const item = await prisma.subject.create({
            data: {
              name: sub.name,
              code: sub.code,
              classId: sub.classId || null,
            },
          });
          created.push(item);
        }
      }

      await logAudit({
        schoolId,
        userId: user.id,
        action: 'SETUP_SUBJECTS_CURRICULUM',
        module: 'ACADEMICS',
        recordId: schoolId,
        newValue: `Created/updated ${subjectsList.length} curriculum subjects`,
      });

      const allSubjects = await prisma.subject.findMany({ include: { class: true } });
      return NextResponse.json({ success: true, subjects: allSubjects, count: created.length });
    }

    // ----------------------------------------------------
    // STEP 5: IMPORT_TEACHERS
    // ----------------------------------------------------
    if (action === 'IMPORT_TEACHERS') {
      const { teachersList } = body; // Array of { firstName, lastName, email, phone, employeeId, department, designation }

      if (!Array.isArray(teachersList) || teachersList.length === 0) {
        return NextResponse.json({ error: 'No teacher records provided' }, { status: 400 });
      }

      const results = [];
      const defaultPasswordHash = await bcrypt.hash('Teacher@2026', 10);

      for (const t of teachersList) {
        if (!t.firstName || !t.email) continue;

        let userRecord = await prisma.user.findUnique({ where: { email: t.email.toLowerCase() } });
        if (!userRecord) {
          const username = t.email.split('@')[0] + Math.floor(Math.random() * 100);
          userRecord = await prisma.user.create({
            data: {
              email: t.email.toLowerCase(),
              username,
              passwordHash: defaultPasswordHash,
              role: 'TEACHER',
              firstName: t.firstName,
              lastName: t.lastName || '',
              phone: t.phone || null,
              schoolId,
            },
          });
        }

        let teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: userRecord.id } });
        if (!teacherProfile) {
          teacherProfile = await prisma.teacherProfile.create({
            data: {
              userId: userRecord.id,
              employeeCode: t.employeeId || t.employeeCode || `EMP-${Date.now().toString().slice(-4)}`,
              specialization: t.department || 'Academics',
              qualification: t.designation || 'B.Ed, M.Sc',
              basicSalary: 45000,
              joiningDate: new Date(),
            },
          });
        }

        results.push({ user: userRecord, profile: teacherProfile });
      }

      await logAudit({
        schoolId,
        userId: user.id,
        action: 'ONBOARDING_IMPORT_TEACHERS',
        module: 'HR_MANAGEMENT',
        recordId: schoolId,
        newValue: `Imported ${results.length} faculty members into teacher roster`,
      });

      return NextResponse.json({ success: true, importedCount: results.length });
    }

    // ----------------------------------------------------
    // STEP 6: IMPORT_STUDENTS
    // ----------------------------------------------------
    if (action === 'IMPORT_STUDENTS') {
      const { studentsList } = body; // Array of { firstName, lastName, admissionNumber, rollNumber, className, sectionName, gender, parentName, parentPhone, parentEmail }

      if (!Array.isArray(studentsList) || studentsList.length === 0) {
        return NextResponse.json({ error: 'No student records provided' }, { status: 400 });
      }

      const defaultPasswordHash = await bcrypt.hash('Student@2026', 10);
      const parentPasswordHash = await bcrypt.hash('Parent@2026', 10);
      const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } }) || await prisma.academicYear.findFirst();

      const created = [];
      const errors = [];

      for (let i = 0; i < studentsList.length; i++) {
        const s = studentsList[i];
        if (!s.firstName || !s.admissionNumber) {
          errors.push(`Row ${i + 1}: Missing student first name or admission number`);
          continue;
        }

        try {
          // Find class & section
          let targetClass = s.className ? await prisma.class.findFirst({ where: { name: s.className } }) : null;
          if (!targetClass) {
            targetClass = await prisma.class.findFirst();
          }

          let targetSection = targetClass && s.sectionName
            ? await prisma.section.findFirst({ where: { classId: targetClass.id, name: s.sectionName } })
            : targetClass
            ? await prisma.section.findFirst({ where: { classId: targetClass.id } })
            : null;

          // Check if admission number exists
          const existingProfile = await prisma.studentProfile.findUnique({
            where: { admissionNumber: s.admissionNumber },
          });

          if (existingProfile) {
            created.push(existingProfile);
            continue;
          }

          const studentEmail = `${s.admissionNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.edvonest.edu`;
          const studentUsername = s.admissionNumber.toLowerCase().replace(/[^a-z0-9]/g, '');

          // Create Student User
          const studentUser = await prisma.user.create({
            data: {
              email: studentEmail,
              username: studentUsername,
              passwordHash: defaultPasswordHash,
              role: 'STUDENT',
              firstName: s.firstName,
              lastName: s.lastName || '',
              schoolId,
            },
          });

          // Create Student Profile
          const studentProfile = await prisma.studentProfile.create({
            data: {
              userId: studentUser.id,
              admissionNumber: s.admissionNumber,
              rollNumber: s.rollNumber ? String(s.rollNumber) : null,
              dob: s.dateOfBirth ? new Date(s.dateOfBirth) : new Date('2010-01-01'),
              gender: s.gender || 'MALE',
              admissionDate: new Date(),
              emergencyContact: s.parentPhone || '+91 98765 00000',
            },
          });

          // Create Parent User if parent info provided
          if (s.parentName) {
            const parentEmail = s.parentEmail || `parent.${studentUsername}@parent.edvonest.edu`;
            let parentUser = await prisma.user.findUnique({ where: { email: parentEmail } });
            if (!parentUser) {
              parentUser = await prisma.user.create({
                data: {
                  email: parentEmail,
                  username: `p_${studentUsername}`,
                  passwordHash: parentPasswordHash,
                  role: 'PARENT',
                  firstName: s.parentName.split(' ')[0] || 'Parent',
                  lastName: s.parentName.split(' ').slice(1).join(' ') || '',
                  phone: s.parentPhone || null,
                  schoolId,
                },
              });
            }

            let parentProfile = await prisma.parentProfile.findUnique({ where: { userId: parentUser.id } });
            if (!parentProfile) {
              parentProfile = await prisma.parentProfile.create({
                data: {
                  userId: parentUser.id,
                  phone: s.parentPhone || '+91 98765 00000',
                  occupation: 'Professional',
                  relation: 'Parent',
                },
              });
            }

            // Link parent via StudentParentMap
            const existingMap = await prisma.studentParentMap.findFirst({
              where: { studentId: studentProfile.id, parentId: parentProfile.id },
            });
            if (!existingMap) {
              await prisma.studentParentMap.create({
                data: {
                  studentId: studentProfile.id,
                  parentId: parentProfile.id,
                  isPrimary: true,
                },
              });
            }
          }

          // Create Enrollment if class and academic year exist
          if (targetClass && targetSection && currentYear) {
            await prisma.studentEnrollment.create({
              data: {
                studentId: studentProfile.id,
                classId: targetClass.id,
                sectionId: targetSection.id,
                academicYearId: currentYear.id,
                rollNumber: s.rollNumber ? String(s.rollNumber) : '1',
              },
            });
          }

          created.push(studentProfile);
        } catch (err: any) {
          errors.push(`Row ${i + 1} (${s.firstName}): ${err.message}`);
        }
      }

      await logAudit({
        schoolId,
        userId: user.id,
        action: 'ONBOARDING_IMPORT_STUDENTS',
        module: 'STUDENTS',
        recordId: schoolId,
        newValue: `Imported ${created.length} students into student registry (${errors.length} skipped)`,
      });

      return NextResponse.json({
        success: true,
        importedCount: created.length,
        errors,
      });
    }

    // ----------------------------------------------------
    // STEP 7: SETUP_FEES
    // ----------------------------------------------------
    if (action === 'SETUP_FEES') {
      const { feeCategories, baseTuitionFee } = body;

      const standardCategories = Array.isArray(feeCategories) && feeCategories.length > 0
        ? feeCategories
        : ['Tuition Fee', 'Admission Fee', 'Annual Development Charges', 'Examination Fee', 'Computer & STEM Lab Fee'];

      const createdCats = [];
      for (const catName of standardCategories) {
        let cat = await prisma.feeCategory.findFirst({ where: { name: catName } });
        if (!cat) {
          cat = await prisma.feeCategory.create({ data: { name: catName } });
        }
        createdCats.push(cat);
      }

      // Check or create default fee structure
      const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } }) || await prisma.academicYear.findFirst();
      const existingStructure = await prisma.feeStructure.findFirst();

      if (!existingStructure && currentYear) {
        const structure = await prisma.feeStructure.create({
          data: {
            title: `Standard Annual Fee Plan ${currentYear.name}`,
            schoolId,
            academicYearId: currentYear.id,
            frequency: 'Quarterly',
            dueDateDays: 10,
            lateFeePerDay: 50,
          },
        });

        // Add fee items
        if (createdCats[0]) {
          await prisma.feeItem.create({
            data: {
              feeStructureId: structure.id,
              categoryId: createdCats[0].id,
              amount: baseTuitionFee ? Number(baseTuitionFee) : 36000,
            },
          });
        }
      }

      await logAudit({
        schoolId,
        userId: user.id,
        action: 'ONBOARDING_SETUP_FEES',
        module: 'FEES_FINANCE',
        recordId: schoolId,
        newValue: `Configured ${createdCats.length} fee categories & default structure`,
      });

      return NextResponse.json({ success: true, categories: createdCats });
    }

    // ----------------------------------------------------
    // STEP 8: SETUP_TIMETABLE
    // ----------------------------------------------------
    if (action === 'SETUP_TIMETABLE') {
      const { periodsCount, startTime, periodDuration, workingDays } = body;

      // Log timetable framework configuration
      await logAudit({
        schoolId,
        userId: user.id,
        action: 'ONBOARDING_SETUP_TIMETABLE',
        module: 'ACADEMICS',
        recordId: schoolId,
        newValue: `Configured timetable framework: ${periodsCount || 8} periods, start: ${startTime || '08:30'}, duration: ${periodDuration || 45}m`,
      });

      return NextResponse.json({
        success: true,
        timetableFramework: {
          periodsCount: periodsCount || 8,
          startTime: startTime || '08:30',
          periodDuration: periodDuration || 45,
          workingDays: workingDays || ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
        },
      });
    }

    // ----------------------------------------------------
    // STEP 10: COMPLETE_ONBOARDING
    // ----------------------------------------------------
    if (action === 'COMPLETE_ONBOARDING') {
      const updated = await prisma.school.update({
        where: { id: schoolId },
        data: {
          onboardingStatus: 'COMPLETED',
        },
      });

      await logAudit({
        schoolId,
        userId: user.id,
        action: 'COMPLETE_ONBOARDING_WIZARD',
        module: 'SETTINGS',
        recordId: schoolId,
        newValue: `School setup completed successfully. All 10 onboarding stages verified.`,
      });

      return NextResponse.json({
        success: true,
        message: 'Onboarding completed successfully!',
        school: updated,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Onboarding POST error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
