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

  try {
    // If Prisma schema includes the table, also update via Prisma
    // @ts-ignore - optional chaining if model not generated
    await prisma?.timesheet_entries?.update({ where: { id }, data })
  } catch (err) {
    console.error('Prisma update failed', err)
  }

  return NextResponse.json({ entry })
}
