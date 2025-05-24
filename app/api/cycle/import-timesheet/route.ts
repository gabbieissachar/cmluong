import { supabaseAdmin } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'
import { calculatePayroll } from '@/lib/payroll'

// Robust CSV parser for quoted/multiline fields
function parseCsv(text: string) {
  const rows = []
  let current = ''
  let inQuotes = false
  let lines = text.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (inQuotes) {
      current += '\n' + line
      if (line.endsWith('"')) {
        inQuotes = false
        rows.push(current)
        current = ''
      }
    } else {
      if ((line.match(/\"/g) || []).length % 2 === 1) {
        inQuotes = true
        current = line
      } else {
        rows.push(line)
      }
    }
  }
  if (current) rows.push(current)
  const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return rows.slice(1).map((row) => {
    const values = []
    let val = ''
    let inside = false
    for (let i = 0; i < row.length; i++) {
      const char = row[i]
      if (char === '"') {
        inside = !inside
      } else if (char === ',' && !inside) {
        values.push(val)
        val = ''
      } else {
        val += char
      }
    }
    values.push(val)
    const record = {}
    headers.forEach((header, idx) => {
      let value = values[idx]?.trim().replace(/^"|"$/g, '')
      if ([
        'total_leave_days',
        'salary',
        'total_working_days_in_month',
        'paid_leave_days',
        'unpaid_leave_days',
        'actual_working_days',
        'parking_allowance',
        'employee_social_insurance_contribution',
        'salary_advance_deduction',
        'tuition_fee_deduction_for_children',
        'employer_social_insurance_contribution',
        'hours'
      ].includes(header)) {
        value = value ? Number(value.replace(/,/g, '')) : null
      }
      record[header] = value
    })
    return record
  })
}

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
        await calculatePayroll(cycle.id)
      } catch (error) {
        console.error('Error calculating payroll:', error)
      }
    }
  }

  return NextResponse.json({ id: cycle?.id })
}
