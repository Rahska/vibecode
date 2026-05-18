import { cookies } from 'next/headers';

/**
 * Checks if the admin is logged in by verifying the 'orbita_admin_session' cookie.
 * @returns boolean
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('orbita_admin_session');
  return session?.value === 'true';
}
