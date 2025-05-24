import { supabaseAdmin } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: { month: string } }) {
  const month = params.month

  if (!month) {
    return NextResponse.json({ error: 'Month parameter is required' }, { status: 400 })
  }

  const { data: cycle, error: cycleError } = await supabaseAdmin
    .from('payroll_cycles')
    .select('id')
    .eq('month', `${month}-01T00:00:00Z`)
    .single()

  if (cycleError || !cycle) {
    console.error('Error finding cycle for month:', month, cycleError)
    return NextResponse.json({ error: 'Cycle not found for this month' }, { status: 404 })
  }

  const { data: entries, error: entriesError } = await supabaseAdmin
    .from('timesheet_entries')
    .select('*')
    .eq('cycle_id', cycle.id)

  if (entriesError) {
    console.error('Error fetching timesheet entries:', entriesError)
    return NextResponse.json({ error: entriesError.message }, { status: 500 })
  }

  const { data: payslips, error: payslipError } = await supabaseAdmin
    .from('payslip')
    .select('user_id, net_salary, pdf_path')
    .eq('cycle_id', cycle.id)

  if (payslipError) {
    console.error('Error fetching payslips:', payslipError)
    return NextResponse.json({ error: payslipError.message }, { status: 500 })
  }

  const slipMap = new Map<string, { net_salary: number | null; pdf_path: string | null }>()
  payslips?.forEach(ps => slipMap.set(ps.user_id, { net_salary: ps.net_salary, pdf_path: ps.pdf_path }))

  const combined = entries?.map(e => ({
    ...e,
    net_salary: slipMap.get(e.user_id)?.net_salary ?? null,
    payslip_pdf: slipMap.get(e.user_id)?.pdf_path ?? null
  })) || []

  return NextResponse.json({ entries: combined })
}
