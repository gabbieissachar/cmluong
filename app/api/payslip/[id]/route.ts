import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { auth } from '@clerk/nextjs/server'
import { getServerUserRole } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  // const { userId } = auth()
  // const role = getServerUserRole()

  const { data: payslip, error } = await supabaseAdmin
    .from('payslip')
    .select('user_id, pdf_path')
    .eq('id', id)
    .single()

  if (error || !payslip) {
    return NextResponse.json({ error: 'Payslip not found' }, { status: 404 })
  }

  // if (role !== 'accountant' && payslip.user_id !== userId) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  // }

  const { data: file, error: fileError } = await supabaseAdmin.storage
    .from('payslips')
    .download(payslip.pdf_path)

  if (fileError) {
    console.error('Storage download error:', fileError)
    console.error('Attempted path:', payslip.pdf_path)
    return NextResponse.json(
      {
        error: 'File not found',
        details: fileError.message,
      },
      { status: 404 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': `inline; filename="${id}.txt"`,
    },
  })
}
