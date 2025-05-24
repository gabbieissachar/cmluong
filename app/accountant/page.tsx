"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

type Cycle = {
  id: string
  month: string
  status: string
}

export default function AccountantOverviewPage() {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch("/api/cycle/list")
      .then((res) => res.json())
      .then((data) => setCycles(data.cycles || []))
  }, [])

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
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Payroll Cycles</h1>
          <Button onClick={() => router.push("/accountant/cycle/create")}>Create New Cycle</Button>
        </div>
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Month</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cycles.map((cycle) => (
              <tr key={cycle.id}>
                <td className="border px-2 py-1">{cycle.month?.slice(0, 7)}</td>
                <td className="border px-2 py-1">{cycle.status}</td>
                <td className="border px-2 py-1">
                  <Button variant="outline" onClick={() => router.push(`/accountant/cycle/${cycle.month?.slice(0, 7)}/detail`)}>
                    View Details
                  </Button>
                  <Button variant="outline" onClick={async () => {
                    const response = await fetch('/api/cycle/calculate-payslip', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ cycleId: cycle.id }),
                    });
                    const result = await response.json();
                    if (result.error) {
                      console.error(result.error);
                    } else {
                      console.log(result.message);
                    }
                  }}>
                    Calculate Payslips
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}