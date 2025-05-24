import { createUser } from './actions'

export default function SignUpPage() {
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
