import { createUser } from './actions'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <>
      <nav className="w-full flex justify-between items-center p-4 border-b mb-6">
        <div className="text-lg font-bold">CM Salary Tool</div>
        <div className="flex gap-2">
          {/* TODO: Add logic to show Sign Out if signed in */}
          <Link href="/sign-up">
            <button className="px-4 py-2 bg-black text-white rounded">Sign Up</button>
          </Link>
          <Link href="/accountant/">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Accountant Cycle</button>
          </Link>
        </div>
      </nav>
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
    </>
  )
}
