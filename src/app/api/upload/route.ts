import { NextRequest, NextResponse } from 'next/server';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { pipeline } from 'stream/promises';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get content-length for progress tracking
    const contentLength = request.headers.get('content-length');
    const totalSize = contentLength ? parseInt(contentLength, 10) : 0;
    
    // Check size before processing (max 50MB)
    if (totalSize > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'حجم فایل بیش از ۵۰ مگابایت است' }, { status: 400 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'فایلی ارسال نشده است' }, { status: 400 });
    }

    // Create uploads directory
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const filePath = join(uploadsDir, fileName);

    // Stream file to disk (much faster than buffering)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Use sync write for small files, async for larger
    if (file.size < 5 * 1024 * 1024) {
      // Small files: direct write
      const { writeFileSync } = await import('fs');
      writeFileSync(filePath, buffer);
    } else {
      // Large files: stream write with high watermark
      const writeStream = createWriteStream(filePath, { 
        highWaterMark: 1024 * 1024 * 2 // 2MB buffer
      });
      await pipeline(buffer, writeStream);
    }

    // Determine file type
    let fileType = 'file';
    const mime = file.type.toLowerCase();
    if (mime.startsWith('image/')) fileType = 'image';
    else if (mime.startsWith('video/')) fileType = 'video';
    else if (mime.startsWith('audio/')) fileType = 'audio';
    else if (mime === 'application/pdf') fileType = 'pdf';

    const uploadTime = Date.now() - startTime;
    console.log(`✅ Upload completed in ${uploadTime}ms: ${file.name} (${file.size} bytes)`);

    return NextResponse.json({
      url: `/api/files/${fileName}`,
      fileType,
      fileName: file.name,
      fileSize: file.size,
      uploadTime,
    });
    
  } catch (err: unknown) {
    const error = err as Error;
    console.error('❌ Upload error:', error);
    return NextResponse.json({ error: 'خطا در آپلود: ' + error.message }, { status: 500 });
  }
}
