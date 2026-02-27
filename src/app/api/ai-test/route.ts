import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'AI API is working!',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'AI POST is working!',
    response: 'سلام! من درست کار می‌کنم! 🎉',
    timestamp: new Date().toISOString()
  });
}
