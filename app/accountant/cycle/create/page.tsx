"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import axios from 'axios'

export default function CreateCyclePage() {
  const [month, setMonth] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()
  const [error, setError] = useState("")

  const handleImport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!month) {
      setError("Please select a month.")
      return
    }
    if (!file) {
      setError("Please select a CSV file.")
      return
    }
    setError("")
    const formData = new FormData()
    formData.append("file", file)
    formData.append("month", month)
    try {
      const response = await axios.post("/api/cycle/import-timesheet", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      router.push(`/accountant/cycle/${month}/detail`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Import failed."
      setError(errorMessage)
    }
  }

  const handleClone = async () => {
    if (!month) {
      setError("Please select a month.")
      return
    }
    setError("")
    const data = new FormData()
    data.append("month", month)
    try {
      const response = await axios.post("/api/cycle/clone", data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      router.push(`/accountant/cycle/${month}/detail`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Clone failed."
      setError(errorMessage)
    }
  }

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
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Create New Payroll Cycle</h1>
        <form onSubmit={handleImport} className="mb-4 flex flex-col gap-2">
          <label>
            Month:
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="border rounded px-2 py-1 ml-2"
              required
            />
          </label>
          <label>
            Import CSV:
            <input
              type="file"
              accept=".csv"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="ml-2"
            />
          </label>
          <Button type="submit" className="w-full">Import Timesheet</Button>
        </form>
        <Button variant="outline" className="w-full mb-2" onClick={handleClone}>Clone Last Month</Button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
    </>
  )
}