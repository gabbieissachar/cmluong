'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, SignOutButton } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/sonner'
import axios from 'axios'

export default function CyclePage({ params }: { params: { month: string } }) {
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()
  const { isSignedIn } = useAuth();
  const { toast } = useToast()
  const [importing, setImporting] = useState(false)
  const [cloning, setCloning] = useState(false)

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
        setImporting(true)
        const response = await axios.post('/api/cycle/import-timesheet', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        toast({ title: 'Timesheet imported' })
        router.refresh()
    } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Import failed'
        toast({ title: errorMessage, variant: 'destructive' })
    } finally {
        setImporting(false)
    }
  };

  async function handleClone() {
    const data = new FormData()
    data.append('month', params.month)
    try {
      setCloning(true)
      const response = await axios.post('/api/cycle/import-timesheet', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast({ title: 'Last month cloned' })
      router.refresh()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Clone failed'
      toast({ title: errorMessage, variant: 'destructive' })
    } finally {
      setCloning(false)
    }
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
          <button type="submit" className="rounded bg-black px-3 py-1 text-white" disabled={importing}>
            {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import CSV
          </button>
        </form>
        <button onClick={handleClone} className="rounded bg-gray-300 px-3 py-1" disabled={cloning}>
          {cloning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Clone Last Month
        </button>
        <Toaster />
      </div>
    </>
  )
}
