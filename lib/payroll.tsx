import { supabaseAdmin } from '@/utils/supabase/admin'
import { randomUUID } from 'crypto'
import { pdf } from '@react-pdf/renderer'
import { PayslipPdf, PayslipRow, TimesheetRow } from './payslip-pdf'

export async function calculatePayroll(cycleId: string, userIds?: string[]) {
  let query = supabaseAdmin
    .from('timesheet_entries')
    .select('*')
    .eq('cycle_id', cycleId)

  if (userIds && userIds.length > 0) {
    query = query.in('user_id', userIds)
  }

  const { data: entries, error } = await query

  if (error) {
    throw new Error(`Failed to fetch timesheet entries: ${error.message}`)
  }

  let created = 0
  let updated = 0

  if (!entries) {
    return { created, updated }
  }

  for (const entry of entries) {
    const baseSalary = entry.salary ?? 0
    const allowance = entry.parking_allowance ?? 0
    const deductions =
      (entry.salary_advance_deduction ?? 0) + (entry.tuition_fee_deduction_for_children ?? 0)
    const employeeSI = entry.employee_social_insurance_contribution ?? 0
    const employerSI = entry.employer_social_insurance_contribution ?? 0
    const netSalary = baseSalary + allowance - deductions - employeeSI

    const { data: existing, error: existingError } = await supabaseAdmin
      .from('payslip')
      .select('id')
      .eq('user_id', entry.user_id)
      .eq('cycle_id', cycleId)
      .limit(1)
      .maybeSingle()

    if (existingError) {
      console.error('Error checking existing payslip:', existingError)
      continue
    }

    const basePayload = {
      user_id: entry.user_id,
      cycle_id: cycleId,
      base_salary: baseSalary,
      allowance: allowance,
      deductions: deductions,
      employee_si: employeeSI,
      employer_si: employerSI,
      net_salary: netSalary,
    }

    const id = existing?.id ?? randomUUID()
    const pdfPath = `${cycleId}/${entry.user_id}.pdf`

    const slipRecord = { id, ...basePayload, pdf_path: pdfPath } as PayslipRow
    const pdfBuffer = await pdf(
      <PayslipPdf slip={slipRecord} entry={entry as TimesheetRow} />
    ).toBuffer()

    await supabaseAdmin.storage
      .from('payslips')
      .upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

    const payload = { ...basePayload, pdf_path: pdfPath }

    if (existing) {
      console.log('Updating existing payslip with ID:', existing.id)
      const { error: updateError } = await supabaseAdmin
        .from('payslip')
        .update(payload)
        .eq('id', existing.id)

      if (updateError) {
        console.error('Error updating payslip:', updateError)
      } else {
        updated++
      }
    } else {
      console.log('Attempting to insert new payslip with ID:', id)
      console.log('Payload:', payload)
      const { error: insertError } = await supabaseAdmin.from('payslip').insert({ id, ...payload })

      if (insertError) {
        console.error('Error creating payslip:', insertError)
        console.error('Detailed error:', insertError)
      } else {
        created++
      }
    }
  }

  return { created, updated }
}
