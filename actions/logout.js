'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { lucia } from '@/lib/lucia';
import { getAuth } from '@/utils/get-auth';
import prisma from '@/lib/prisma';


export const signOut = async () => {
  const { session } = await getAuth();

  if (!session) {
    redirect('/sign-in');
  }
  
  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  await prisma.session.deleteMany()
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  redirect('/login');
};