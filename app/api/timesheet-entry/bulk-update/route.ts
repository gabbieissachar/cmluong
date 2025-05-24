import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: Request) {
  const { userIds, cycleId, updates } = await req.json()

  if (!Array.isArray(userIds) || userIds.length === 0 || !updates) {
    return NextResponse.json({ error: 'userIds and updates required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  let query = supabase
    .from('timesheet_entries')
    .update(updates)
    .in('user_id', userIds)

  if (cycleId) {
    query = query.eq('cycle_id', cycleId)
  }

  const { error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Entries updated' })
}
