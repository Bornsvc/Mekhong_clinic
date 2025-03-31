import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getCurrentUserId(): Promise<number | null> {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.id ? session.user.id : null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}