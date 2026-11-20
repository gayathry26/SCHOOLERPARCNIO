import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [books, issues] = await Promise.all([
      prisma.libraryBook.findMany({ orderBy: { title: 'asc' } }),
      prisma.bookIssueRecord.findMany({
        include: {
          book: true,
          student: { include: { user: true } },
        },
        orderBy: { issueDate: 'desc' },
      }),
    ]);

    return NextResponse.json({ success: true, books, issues });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!canAccessModule(user.role, 'LIBRARY') || ['STUDENT', 'PARENT'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only library staff and admins can perform circulation actions' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // Action 1: Add New Book
    if (action === 'ADD_BOOK') {
      const { title, author, isbn, category, rackNumber, totalCopies, price } = body;
      if (!title || !author || !isbn) {
        return NextResponse.json({ error: 'Title, Author, and ISBN are required' }, { status: 400 });
      }

      const copies = parseInt(totalCopies) || 1;
      const book = await prisma.libraryBook.create({
        data: {
          title,
          author,
          isbn,
          category: category || 'General',
          rackNumber: rackNumber || 'RACK-01',
          totalCopies: copies,
          availableCopies: copies,
          price: parseFloat(price) || 250,
        },
      });

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'ADD_LIBRARY_BOOK',
        module: 'LIBRARY',
        recordId: book.id,
        newValue: `Added book to catalog: "${title}" by ${author} (ISBN: ${isbn}, Copies: ${copies})`,
      });

      return NextResponse.json({ success: true, book });
    }

    // Action 2: Issue Book to Student
    if (action === 'ISSUE_BOOK') {
      const { bookId, studentId, days } = body;
      if (!bookId || !studentId) {
        return NextResponse.json({ error: 'Book ID and Student ID are required' }, { status: 400 });
      }

      const book = await prisma.libraryBook.findUnique({ where: { id: bookId } });
      if (!book || book.availableCopies <= 0) {
        return NextResponse.json({ error: 'Book is not available for issue' }, { status: 400 });
      }

      const issueDays = parseInt(days) || 14;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + issueDays);

      const [issue] = await prisma.$transaction([
        prisma.bookIssueRecord.create({
          data: {
            bookId,
            studentId,
            dueDate,
            status: 'ISSUED',
          },
          include: {
            book: true,
            student: { include: { user: true } },
          },
        }),
        prisma.libraryBook.update({
          where: { id: bookId },
          data: { availableCopies: { decrement: 1 } },
        }),
      ]);

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'ISSUE_LIBRARY_BOOK',
        module: 'LIBRARY',
        recordId: issue.id,
        newValue: `Issued book "${book.title}" to student #${studentId} (Due: ${dueDate.toISOString().slice(0, 10)})`,
      });

      return NextResponse.json({ success: true, issue });
    }

    // Action 3: Return Issued Book
    if (action === 'RETURN_BOOK') {
      const { issueId } = body;
      if (!issueId) {
        return NextResponse.json({ error: 'Issue record ID is required' }, { status: 400 });
      }

      const existingIssue = await prisma.bookIssueRecord.findUnique({
        where: { id: issueId },
        include: { book: true },
      });

      if (!existingIssue || existingIssue.status === 'RETURNED') {
        return NextResponse.json({ error: 'Issue record already returned or not found' }, { status: 400 });
      }

      const [updated] = await prisma.$transaction([
        prisma.bookIssueRecord.update({
          where: { id: issueId },
          data: {
            status: 'RETURNED',
            returnDate: new Date(),
          },
          include: {
            book: true,
            student: { include: { user: true } },
          },
        }),
        prisma.libraryBook.update({
          where: { id: existingIssue.bookId },
          data: { availableCopies: { increment: 1 } },
        }),
      ]);

      await logAudit({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'RETURN_LIBRARY_BOOK',
        module: 'LIBRARY',
        recordId: issueId,
        newValue: `Returned book "${existingIssue.book.title}" to catalog shelf`,
      });

      return NextResponse.json({ success: true, issue: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
