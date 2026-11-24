import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/students/[id]/documents
 * List all documents belonging to a student.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // RBAC: Students can only see their own docs, Parents only their child's
    if (user.role === 'STUDENT') {
      const self = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      if (self?.id !== id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (user.role === 'PARENT') {
      const parent = await prisma.parentProfile.findUnique({
        where: { userId: user.id },
        include: { students: true },
      });
      if (!parent?.students.some((s) => s.studentId === id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const documents = await prisma.studentDocument.findMany({
      where: { studentId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error('Error fetching student documents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/students/[id]/documents
 * Upload / add a new document record.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { title, documentType, fileUrl, fileSize, format, notes } = body;

    if (!title || !documentType || !fileUrl) {
      return NextResponse.json(
        { error: 'Document title, document type, and file URL are required.' },
        { status: 400 }
      );
    }

    // Admins and Principals automatically verify upon upload; others start as PENDING
    const isAdmin = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(user.role);
    const initialStatus = isAdmin ? 'VERIFIED' : 'PENDING';

    const document = await prisma.studentDocument.create({
      data: {
        studentId: id,
        title,
        documentType,
        fileUrl,
        fileSize: fileSize || '1.4 MB',
        format: format || 'PDF',
        status: initialStatus,
        verifiedById: isAdmin ? user.id : null,
        verifiedAt: isAdmin ? new Date() : null,
        notes: notes || null,
      },
    });

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'UPLOAD_STUDENT_DOCUMENT',
      module: 'STUDENTS',
      recordId: document.id,
      newValue: `Uploaded ${documentType}: "${title}" for student ${id}`,
    });

    return NextResponse.json({ success: true, document });
  } catch (error: any) {
    console.error('Error uploading student document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/students/[id]/documents
 * Verify or Reject a document. Restricted to Administrators & Principals.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'];
    if (!ALLOWED.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only administrators can verify documents.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { documentId, status, rejectionReason } = body;

    if (!documentId || !['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Document ID and valid status (VERIFIED or REJECTED) required.' }, { status: 400 });
    }

    const updated = await prisma.studentDocument.update({
      where: { id: documentId, studentId: id },
      data: {
        status,
        verifiedById: user.id,
        verifiedAt: new Date(),
        rejectionReason: status === 'REJECTED' ? rejectionReason || 'Document could not be verified' : null,
      },
    });

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: status === 'VERIFIED' ? 'VERIFY_STUDENT_DOCUMENT' : 'REJECT_STUDENT_DOCUMENT',
      module: 'STUDENTS',
      recordId: documentId,
      newValue: `Document ${documentId} marked as ${status} by ${user.role}`,
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (error: any) {
    console.error('Error verifying document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/students/[id]/documents
 * Remove a document. Restricted to Administrators.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ALLOWED = ['SUPER_ADMIN', 'SCHOOL_ADMIN'];
    if (!ALLOWED.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only School Administrators can delete documents.' }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'documentId query parameter is required.' }, { status: 400 });
    }

    await prisma.studentDocument.delete({
      where: { id: documentId, studentId: id },
    });

    return NextResponse.json({ success: true, message: 'Document removed successfully.' });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
