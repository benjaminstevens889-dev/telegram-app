import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId?: string;
  username?: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security',
  cookieName: 'telegram_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // True in production (HTTPS), false in development
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  },
};

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    
    if (!session.isLoggedIn) {
      session.isLoggedIn = false;
    }
    
    return session;
  } catch (error) {
    console.error('Session error:', error);
    return { isLoggedIn: false } as SessionData;
  }
}
