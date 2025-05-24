import { supabaseAdmin } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/)
  const rows = lines.slice(1)
  return rows.map((line) => {
    const [user_id, entry_date, hours] = line.split(',')
    return { user_id, entry_date, hours: hours ? Number(hours) : null }
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
    // If a cycle exists, return a conflict response
    return NextResponse.json(
      { error: `Payroll cycle for ${month} already exists.` },
      { status: 409 }
    )
  }

  let entries: { user_id: string; entry_date: string; hours: number | null }[] = []

  if (file) {
    const text = await file.text()
    entries = parseCsv(text)
  } else {
    const prev = new Date(`${month}-01`)
    prev.setMonth(prev.getMonth() - 1)
    const { data: prevCycle } = await supabaseAdmin
      .from('payroll_cycles')
      .select('id')
      .eq('month', prev.toISOString().slice(0, 10))
      .single()
    if (prevCycle) {
      const { data: prevEntries } = await supabaseAdmin
        .from('timesheet_entries')
        .select('user_id,entry_date,hours')
        .eq('cycle_id', prevCycle.id)
      entries = prevEntries || []
    }
  }

  const formattedMonth = `${month}-01T00:00:00Z`;
  const { data: cycle, error: insertError } = await supabaseAdmin
    .from('PayrollCycle') // or 'payroll_cycles' if that's your actual table name
    .insert({
      id: crypto.randomUUID(),
      month: formattedMonth,
      status: 'DRAFT'
    })
    .select()
    .single();
  console.log('Insert error:', insertError);

  console.log('Cycle object before response:', cycle)
  if (cycle && entries.length > 0) {
    await supabaseAdmin
      .from('timesheet_entries')
      .insert(entries.map((e) => ({ ...e, cycle_id: cycle.id })))
  }

  console.log('Cycle object before response:', cycle)
  return NextResponse.json({ id: cycle?.id })
}
