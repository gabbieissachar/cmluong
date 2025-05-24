import { supabaseAdmin } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: { month: string } }) {
  const month = params.month

  if (!month) {
    return NextResponse.json({ error: 'Month parameter is required' }, { status: 400 })
  }

  // Find the cycle ID for the given month
  const { data: cycle, error: cycleError } = await supabaseAdmin
    .from('payroll_cycles')
    .select('id')
    .eq('month', `${month}-01T00:00:00Z`)
    .single()

  if (cycleError || !cycle) {
    console.error('Error finding cycle for month:', month, cycleError)
    return NextResponse.json({ error: 'Cycle not found for this month' }, { status: 404 })
  }

  // Fetch timesheet entries for the found cycle ID
  const { data: entries, error: entriesError } = await supabaseAdmin
    .from('timesheet_entries')
    .select('*') // Select all fields for now
    .eq('cycle_id', cycle.id)

  if (entriesError) {
    console.error('Error fetching timesheet entries:', entriesError)
    return NextResponse.json({ error: entriesError.message }, { status: 500 })
  }

  return NextResponse.json({ entries })
}
