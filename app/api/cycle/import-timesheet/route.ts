import { supabaseAdmin } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'
import axios from 'axios'
import { parseCsv } from '@/lib/parseCsv'

export async function POST(req: Request) {
  const formData = await req.formData()
  const month = String(formData.get('month'))
  if (!month) {
    return NextResponse.json({ error: 'month required' }, { status: 400 })
  }
  const file = formData.get('file') as File | null

  // Check if a payroll cycle for this month already exists
  const { data: existingCycle } = await supabaseAdmin
    .from('payroll_cycles')
    .select('id')
    .eq('month', month)
    .single()

  if (existingCycle) {
    return NextResponse.json(
      { error: `Payroll cycle for ${month} already exists.` },
      { status: 409 }
    )
  }

  let entries: any[] = []

  if (file) {
    const text = await file.text()
    entries = parseCsv(text)
    console.log('Parsed entries from uploaded file:', entries)
  } else {
    return NextResponse.json({ error: 'CSV file required' }, { status: 400 })
  }

  const formattedMonth = `${month}-01T00:00:00Z`
  const { data: cycle, error: insertError } = await supabaseAdmin
    .from('payroll_cycles')
    .insert({
      month: formattedMonth,
      status: 'DRAFT',
    })
    .select()
    .single()
  console.log('Insert error:', insertError)

  console.log('Cycle object before response:', cycle)
  console.log('Entries to insert:', entries)
  if (cycle && entries.length > 0) {
    const { error: timesheetInsertError } = await supabaseAdmin
      .from('timesheet_entries')
      .insert(entries.map((e) => ({ ...e, cycle_id: cycle.id })))
    if (timesheetInsertError) {
      console.error('Error inserting timesheet entries:', timesheetInsertError)
    } else {
      console.log('Timesheet entries inserted successfully')
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cycle/calculate-payslip`,
          { cycleId: cycle.id }
        )
        console.log('Payslip calculation result:', response.data)
      } catch (error) {
        console.error('Error calling payslip calculation endpoint:', error)
      }
    }
  }
  return NextResponse.json({ id: cycle?.id })
}
