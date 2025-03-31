import { getSession } from 'next-auth/react';

export async function getCurrentUserId(): Promise<number> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    return Number(session.user.id);
  } catch (error) {
    console.error('Error getting current user ID:', error);
    throw error;
  }
}