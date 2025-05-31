import { parse } from 'csv-parse/sync'

const numericFields = [
  'total_leave_days',
  'salary',
  'total_working_days_in_month',
  'paid_leave_days',
  'unpaid_leave_days',
  'actual_working_days',
  'parking_allowance',
  'employee_social_insurance_contribution',
  'salary_advance_deduction',
  'tuition_fee_deduction_for_children',
  'employer_social_insurance_contribution',
  'hours',
]

export interface CsvRecord {
  [key: string]: string | number | null
}

export function parseCsv(text: string): CsvRecord[] {
  const records = parse(text, { columns: true, skip_empty_lines: true, trim: true }) as CsvRecord[]

  return records.map((record) => {
    for (const field of numericFields) {
      if (record[field] !== undefined) {
        const value = String(record[field])
        record[field] = value ? Number(value.replace(/,/g, '')) : null
      }
    }
    return record
  })
}
