import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import prisma from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const data = await req.json()
  const supabase = createAdminClient()
  const { data: entry, error } = await supabase
    .from('timesheet_entries')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entry })
}
