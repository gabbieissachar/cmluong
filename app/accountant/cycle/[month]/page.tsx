'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CyclePage({ params }: { params: { month: string } }) {
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()

  async function handleImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData()
    if (file) data.append('file', file)
    data.append('month', params.month)
    await fetch('/app/api/cycle/import-timesheet', {
      method: 'POST',
      body: data,
    })
    router.refresh()
  }

  async function handleClone() {
    const data = new FormData()
    data.append('month', params.month)
    await fetch('/app/api/cycle/import-timesheet', {
      method: 'POST',
      body: data,
    })
    router.refresh()
  }

  return (
    <div className="p-4">
      <form onSubmit={handleImport} className="mb-4 flex gap-2">
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="submit" className="rounded bg-black px-3 py-1 text-white">Import CSV</button>
      </form>
      <button onClick={handleClone} className="rounded bg-gray-300 px-3 py-1">Clone Last Month</button>
    </div>
  )
}
