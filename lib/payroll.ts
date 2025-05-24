import { supabaseAdmin } from '@/utils/supabase/admin'
import { randomUUID } from 'crypto'

export async function calculatePayroll(cycleId: string) {
  const { data: entries, error } = await supabaseAdmin
    .from('timesheet_entries')
    .select('*')
    .eq('cycle_id', cycleId)

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
      (entry.salary_advance_deduction ?? 0) +
      (entry.tuition_fee_deduction_for_children ?? 0)
    const employeeSI = entry.employee_social_insurance_contribution ?? 0
    const employerSI = entry.employer_social_insurance_contribution ?? 0
    const netSalary = baseSalary + allowance - deductions - employeeSI

    const { data: existing, error: existingError } = await supabaseAdmin
      .from('Payslip')
      .select('id')
      .eq('userId', entry.user_id)
      .eq('cycleId', cycleId)
      .limit(1)
      .maybeSingle()

    if (existingError) {
      console.error('Error checking existing payslip:', existingError)
      continue
    }

    const payload = {
      userId: entry.user_id,
      cycleId,
      baseSalary,
      allowance,
      deductions,
      employeeSI,
      employerSI,
      netSalary,
    }

    if (existing) {
      const { error: updateError } = await supabaseAdmin
        .from('Payslip')
        .update(payload)
        .eq('id', existing.id)

      if (updateError) {
        console.error('Error updating payslip:', updateError)
      } else {
        updated++
      }
    } else {
      const id = randomUUID()
      const { error: insertError } = await supabaseAdmin
        .from('Payslip')
        .insert({ id, ...payload })

      if (insertError) {
        console.error('Error creating payslip:', insertError)
      } else {
        created++
      }
    }
  }

  return { created, updated }
}
