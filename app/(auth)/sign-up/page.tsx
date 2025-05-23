import { clerkClient } from '@clerk/nextjs/server'

export default function SignUpPage() {
  async function createUser(formData: FormData) {
    'use server'
    const email = String(formData.get('email'))
    const password = String(formData.get('password'))
    const role = String(formData.get('role')) as 'accountant' | 'staff'

    await clerkClient.users.createUser({
      emailAddress: [email],
      password,
      publicMetadata: { role },
    })
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
