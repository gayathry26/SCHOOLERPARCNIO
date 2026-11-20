import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const pages = await prisma.cmsPage.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json({ success: true, pages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!canAccessModule(user.role, 'SETTINGS')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges to update public CMS' }, { status: 403 });
    }

    const { id, title, content } = await req.json();
    if (!id || !title || !content) {
      return NextResponse.json({ error: 'Page ID, title, and content are required' }, { status: 400 });
    }

    const updated = await prisma.cmsPage.update({
      where: { id },
      data: {
        title,
        content,
      },
    });

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'UPDATE_CMS_PAGE',
      module: 'SETTINGS',
      recordId: id,
      newValue: `Updated public CMS content for page: ${title} (slug: ${updated.slug})`,
    });

    return NextResponse.json({ success: true, page: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!canAccessModule(user.role, 'SETTINGS')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, slug, content } = await req.json();
    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 });
    }

    const school = await prisma.school.findFirst();
    const created = await prisma.cmsPage.create({
      data: {
        schoolId: school?.id || 'edvonest-main-school',
        title,
        slug: slug.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content,
      },
    });

    await logAudit({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'CREATE_CMS_PAGE',
      module: 'SETTINGS',
      recordId: created.id,
      newValue: `Created new CMS page: ${title} (/slug: ${created.slug})`,
    });

    return NextResponse.json({ success: true, page: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
