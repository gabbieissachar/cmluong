import { supabaseAdmin } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'
import { calculatePayroll } from '@/lib/payroll'

export async function POST(req: Request) {
  const formData = await req.formData()
  const month = String(formData.get('month') || '')

  if (!month) {
    return NextResponse.json({ error: 'month required' }, { status: 400 })
  }

  const formattedMonth = `${month}-01T00:00:00Z`

  // Get most recent cycle before the requested month
  const { data: prevCycle, error: prevError } = await supabaseAdmin
    .from('payroll_cycles')
    .select('id, month')
    .lt('month', formattedMonth)
    .order('month', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (prevError || !prevCycle) {
    console.error('Previous cycle not found:', prevError)
    return NextResponse.json({ error: 'Previous cycle not found' }, { status: 404 })
  }

  // Create new cycle in DRAFT status
  const { data: newCycle, error: insertError } = await supabaseAdmin
    .from('payroll_cycles')
    .insert({ month: formattedMonth, status: 'DRAFT' })
    .select()
    .single()

  if (insertError || !newCycle) {
    console.error('Error creating cycle:', insertError)
    return NextResponse.json({ error: insertError?.message || 'Failed to create cycle' }, { status: 500 })
  }

  // Fetch timesheet entries from the previous cycle
  const { data: prevEntries, error: entriesError } = await supabaseAdmin
    .from('timesheet_entries')
    .select('*')
    .eq('cycle_id', prevCycle.id)

  if (entriesError) {
    console.error('Error fetching previous entries:', entriesError)
    return NextResponse.json({ error: entriesError.message }, { status: 500 })
  }

  if (prevEntries && prevEntries.length > 0) {
    const entriesToInsert = prevEntries.map(({ id, cycle_id, created_at, ...rest }) => ({
      ...rest,
      cycle_id: newCycle.id,
    }))

    const { error: insertEntriesError } = await supabaseAdmin
      .from('timesheet_entries')
      .insert(entriesToInsert)

    if (insertEntriesError) {
      console.error('Error cloning entries:', insertEntriesError)
    }
  }

  try {
    await calculatePayroll(newCycle.id)
  } catch (error) {
    console.error('Error calculating payroll:', error)
  }

  return NextResponse.json({ id: newCycle.id })
}
