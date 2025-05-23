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

  const { data: cycle } = await supabaseAdmin
    .from('payroll_cycles')
    .insert({ month })
    .select()
    .single()

  if (cycle && entries.length > 0) {
    await supabaseAdmin
      .from('timesheet_entries')
      .insert(entries.map((e) => ({ ...e, cycle_id: cycle.id })))
  }

  return NextResponse.json({ id: cycle?.id })
}
