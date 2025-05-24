"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}