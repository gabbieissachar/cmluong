import { NextResponse } from 'next/server'
import { calculatePayroll } from '@/lib/payroll'

export async function POST(req: Request) {
  const { cycleId, userIds } = await req.json()

  if (!cycleId) {
    return NextResponse.json({ error: 'cycleId required' }, { status: 400 })
  }

  const ids = Array.isArray(userIds) ? userIds : undefined

  try {
    await calculatePayroll(cycleId, ids)

    return NextResponse.json({ message: 'Payslip calculated and inserted successfully' })
  } catch (error) {
    console.error('Error calculating payroll:', error)
    return NextResponse.json({ error: 'Error calculating payroll' }, { status: 500 })
  }
}
