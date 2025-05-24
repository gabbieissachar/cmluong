'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CyclePage({ params }: { params: { month: string } }) {
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()

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
    <div className="p-4">
      <form onSubmit={handleImport} className="mb-4 flex gap-2">
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="submit" className="rounded bg-black px-3 py-1 text-white">Import CSV</button>
      </form>
      <button onClick={handleClone} className="rounded bg-gray-300 px-3 py-1">Clone Last Month</button>
    </div>
  )
}
