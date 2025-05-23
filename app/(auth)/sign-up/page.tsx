import { redirect } from 'next/navigation'

export default function SignUpPage() {
  async function createUser(formData: FormData) {
    'use server'
    const { clerkClient } = await import('@clerk/nextjs/server')
    const client = await clerkClient();
    const email = String(formData.get('email'));
    const password = String(formData.get('password'));
    const role = String(formData.get('role')) as 'accountant' | 'staff';
    try {
      await client.users.createUser({
        emailAddress: [email], // <-- camelCase
        password, // Ensure this is at least 8 characters
        publicMetadata: { role },
      })
      redirect('/app/(auth)/sign-in')
    } catch (error: any) {
      console.error('Clerk createUser error:', error);
      if (error && error.errors) {
        error.errors.forEach((err: any) => {
          console.error('Clerk error:', err.message, err.longMessage, err.meta);
        });
      }
      throw error;
    }
  }

  return (
    <form action={createUser} className="mx-auto mt-10 flex w-80 flex-col gap-4">
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        className="rounded border p-2"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        className="rounded border p-2"
      />
      <select name="role" className="rounded border p-2">
        <option value="staff">Staff</option>
        <option value="accountant">Accountant</option>
      </select>
      <button type="submit" className="rounded bg-black p-2 text-white">
        Create user
      </button>
    </form>
  )
}
