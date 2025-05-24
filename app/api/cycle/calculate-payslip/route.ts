import { NextResponse } from 'next/server'
import { calculatePayroll } from '@/lib/payroll'
import { supabaseAdmin } from '@/utils/supabase/admin'

export async function POST(req: Request) {
  const { cycleId } = await req.json()
  if (!cycleId) {
    return NextResponse.json({ error: 'cycleId required' }, { status: 400 })
  }

  try {
    const payslipData = await calculatePayroll(cycleId)

    // Insert the calculated payslip into the payslip table
    const { error: payslipInsertError } = await supabaseAdmin
      .from('payslips')
      .insert({ cycle_id: cycleId, ...payslipData })
    if (payslipInsertError) {
      console.error('Error inserting payslip:', payslipInsertError)
      return NextResponse.json({ error: 'Error inserting payslip' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Payslip calculated and inserted successfully' })
  } catch (error) {
    console.error('Error calculating payroll:', error)
    return NextResponse.json({ error: 'Error calculating payroll' }, { status: 500 })
  }
}
