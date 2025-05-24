'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, SignOutButton } from '@clerk/nextjs'

export default function CyclePage({ params }: { params: { month: string } }) {
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()
  const { isSignedIn } = useAuth();

  const handleImport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
        alert('Please select a file first.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('month', params.month);

    try {
        const response = await fetch('/api/cycle/import-timesheet', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        console.log('API Response:', JSON.stringify(result, null, 2));
        router.refresh()
    } catch (error) {
        console.error('Error importing timesheet:', error);
        alert('Error importing timesheet.');
    }
  };

  async function handleClone() {
    const data = new FormData()
    data.append('month', params.month)
    await fetch('/api/cycle/import-timesheet', {
      method: 'POST',
      body: data,
    })
    router.refresh()
  }

  return (
    <>
      <nav className="w-full flex justify-between items-center p-4 border-b mb-6">
        <div className="text-lg font-bold">CM Salary Tool</div>
        <div className="flex gap-2">
          {isSignedIn ? (
            <SignOutButton>
              <button className="px-4 py-2 bg-black text-white rounded">Sign Out</button>
            </SignOutButton>
          ) : (
            <Link href="/sign-up">
              <button className="px-4 py-2 bg-black text-white rounded">Sign Up</button>
            </Link>
          )}
          <Link href="/accountant/">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Accountant Cycle</button>
          </Link>
        </div>
      </nav>
      <div className="p-4">
        <form onSubmit={handleImport} className="mb-4 flex gap-2">
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button type="submit" className="rounded bg-black px-3 py-1 text-white">Import CSV</button>
        </form>
        <button onClick={handleClone} className="rounded bg-gray-300 px-3 py-1">Clone Last Month</button>
      </div>
    </>
  )
}
