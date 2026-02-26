import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filePath = path.join('/home/z/my-project/download', filename);
    
    const fileBuffer = await readFile(filePath);
    
    const contentType = filename.endsWith('.zip') 
      ? 'application/zip' 
      : filename.endsWith('.tsx') 
        ? 'text/typescript' 
        : 'application/octet-stream';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
