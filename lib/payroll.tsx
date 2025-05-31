import { supabaseAdmin } from '@/utils/supabase/admin'
import { randomUUID } from 'crypto'
import { pdf } from '@react-pdf/renderer'
import {
  PayslipPdf,
  PayslipItem,
  PayslipRow,
  TimesheetRow,
} from './payslip-pdf'
import { format } from 'date-fns'

export async function calculatePayroll(cycleId: string, userIds?: string[]) {
  const { data: cycle, error: cycleError } = await supabaseAdmin
    .from('payroll_cycles')
    .select('month')
    .eq('id', cycleId)
    .single()

  if (cycleError || !cycle) {
    throw new Error('Failed to fetch payroll cycle information')
  }

  const monthYear = format(new Date(cycle.month), 'MM/yyyy')
  const currentDate = format(new Date(), 'dd/MM/yyyy')
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

    const positiveItems: PayslipItem[] = []
    if (baseSalary > 0)
      positiveItems.push({ description: 'Lương cơ bản', amount: baseSalary })
    if (allowance > 0)
      positiveItems.push({ description: 'Phụ cấp', amount: allowance })

    const negativeItems: PayslipItem[] = []
    if ((entry.salary_advance_deduction ?? 0) > 0)
      negativeItems.push({
        description: 'Tạm ứng lương',
        amount: entry.salary_advance_deduction!,
      })
    if ((entry.tuition_fee_deduction_for_children ?? 0) > 0)
      negativeItems.push({
        description: 'Khấu trừ học phí',
        amount: entry.tuition_fee_deduction_for_children!,
      })
    if (employeeSI > 0)
      negativeItems.push({ description: 'BHXH nhân viên', amount: employeeSI })

    const pdfBuffer = await pdf(
      <PayslipPdf
        entry={entry}
        monthYear={monthYear}
        date={currentDate}
        positiveItems={positiveItems}
        negativeItems={negativeItems}
        total={netSalary}
      />
    ).toBuffer()

    const { error: uploadError } = await supabaseAdmin.storage
      .from('payslips')
      .upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('Error uploading PDF to storage:', uploadError)
      continue
    }

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
