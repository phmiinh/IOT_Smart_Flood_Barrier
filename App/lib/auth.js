import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Gets the current user session on the server side.
 * Use this in API routes and server components.
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Checks if the current user has ADMIN role.
 * Returns null if not authenticated, false if not admin, true if admin.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || !session.user) {
    return null;
  }
  return session.user.role === 'ADMIN';
}

