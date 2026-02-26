import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { error: 'نام فایل نامعتبر است' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'فایل یافت نشد' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await readFile(filePath);
    const fileStat = await stat(filePath);

    // Determine content type based on extension
    const ext = filename.split('.').pop()?.toLowerCase() || 'bin';
    const contentTypes: Record<string, string> = {
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon',
      'bmp': 'image/bmp',
      // Audio
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'webm': 'audio/webm',
      'm4a': 'audio/mp4',
      'aac': 'audio/aac',
      // Video
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      // Archives
      'zip': 'application/zip',
      'rar': 'application/vnd.rar',
      '7z': 'application/x-7z-compressed',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
      // Other
      'json': 'application/json',
      'xml': 'application/xml',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';

    // Create response with proper headers
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStat.size.toString(),
        'Cache-Control': 'public, max-age=31536000',
        'Accept-Ranges': 'bytes',
      },
    });

    return response;
  } catch (error) {
    console.error('File serve error:', error);
    return NextResponse.json(
      { error: 'خطا در خواندن فایل' },
      { status: 500 }
    );
  }
}
