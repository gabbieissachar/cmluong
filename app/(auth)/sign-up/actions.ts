'use server'

import { redirect } from 'next/navigation'
import { clerkClient } from '@clerk/nextjs/server'

export async function createUser(formData: FormData) {
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  const role = String(formData.get('role')) as 'accountant' | 'staff'
  try {
    await clerkClient.users.createUser({
      emailAddress: [email],
      password,
      publicMetadata: { role },
    })
    redirect('/sign-in')
  } catch (error: any) {
    console.error('Clerk createUser error:', error)
    if (error && error.errors) {
      error.errors.forEach((err: any) => {
        console.error('Clerk error:', err.message, err.longMessage, err.meta)
      })
    }
    throw error
  }
}
