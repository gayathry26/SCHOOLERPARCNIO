import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'];
    if (!ALLOWED.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only administrators can bulk import students.' }, { status: 403 });
    }

    const { rows } = await req.json();
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No data rows provided' }, { status: 400 });
    }

    const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    if (!currentYear) return NextResponse.json({ error: 'Active academic year not found' }, { status: 400 });

    const defaultPassword = await hashPassword('password123');
    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = row['Student Name'] || row['name'] || row['Name'];
      const className = row['Class'] || row['class'] || 'Class 10';
      const sectionName = row['Section'] || row['section'] || 'A';
      const gender = (row['Gender'] || 'MALE').toUpperCase();
      const parentName = row['Parent Name'] || row['parentName'] || 'Parent';
      const phone = row['Phone'] || row['phone'] || '+91 98000 00000';

      if (!name) {
        errors.push(`Row ${i + 1}: Student Name is missing.`);
        continue;
      }

      const [firstName, ...rest] = name.trim().split(' ');
      const lastName = rest.join(' ') || 'Student';
      const admNo = `EDV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      // Resolve Class & Section
      let cls = await prisma.class.findFirst({
        where: { name: className, academicYearId: currentYear.id },
        include: { sections: true },
      });

      if (!cls) {
        cls = await prisma.class.findFirst({
          where: { academicYearId: currentYear.id },
          include: { sections: true },
        });
      }

      const section = cls?.sections.find((s) => s.name === sectionName) || cls?.sections[0];

      // Create student user
      const stUser = await prisma.user.create({
        data: {
          schoolId: user.schoolId,
          email: `student.${admNo.toLowerCase()}@edvonest.com`,
          username: admNo.toLowerCase(),
          passwordHash: defaultPassword,
          role: 'STUDENT',
          firstName,
          lastName,
          phone,
        },
      });

      const stProfile = await prisma.studentProfile.create({
        data: {
          userId: stUser.id,
          admissionNumber: admNo,
          rollNumber: `R${100 + i}`,
          dob: new Date('2012-05-15'),
          gender: gender === 'FEMALE' ? 'FEMALE' : 'MALE',
          bloodGroup: 'B+',
          address: 'Main City',
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201301',
          emergencyContact: phone,
          house: 'Ruby',
        },
      });

      if (cls && section) {
        await prisma.studentEnrollment.create({
          data: {
            studentId: stProfile.id,
            academicYearId: currentYear.id,
            classId: cls.id,
            sectionId: section.id,
            rollNumber: `R${100 + i}`,
            status: 'ACTIVE',
          },
        });
      }

      importedCount++;
    }

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'BULK_IMPORT_STUDENTS',
      module: 'STUDENTS',
      newValue: `Imported ${importedCount} students via CSV spreadsheet`,
    });

    return NextResponse.json({
      success: true,
      importedCount,
      errors,
    });
  } catch (error: any) {
    console.error('Error during bulk import:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
