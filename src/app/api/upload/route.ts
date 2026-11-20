import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { SecureStorageService } from '@/lib/storage/secure-storage';
import path from 'path';
import fs from 'fs';

const storage = new SecureStorageService('./public/uploads', 5);

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { imageBase64, filename = 'avatar.jpg', studentId } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Missing imageBase64 data' }, { status: 400 });
    }

    // Parse base64 data URL
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: 'Invalid base64 image data' }, { status: 400 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Ensure public/uploads directory exists
    const uploadsDir = path.resolve(process.cwd(), './public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Store buffer securely
    const stored = await storage.storeBuffer(buffer, filename, mimeType, user.schoolId || 'edvonest-main');

    // Return public relative URL
    const publicUrl = `/uploads/${path.basename(stored.storagePath)}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      sizeBytes: stored.sizeBytes,
      mimeType: stored.mimeType,
      checksum: stored.sha256Checksum,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message || 'File upload failed' }, { status: 500 });
  }
}
