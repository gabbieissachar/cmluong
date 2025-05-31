import { supabaseAdmin } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data: cycles, error } = await supabaseAdmin
    .from('payroll_cycles')
    .select('id, month, status')
    .order('month', { ascending: false })

  if (error) {
    console.error('Error fetching payroll cycles:', error)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    // Don't log the full service role key in production!
    console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ cycles })
}
