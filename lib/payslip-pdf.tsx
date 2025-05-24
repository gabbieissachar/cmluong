import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Database } from '@/types/database.types'

export type PayslipRow = Database['public']['Tables']['payslip']['Row']
export type TimesheetRow = Database['public']['Tables']['timesheet_entries']['Row']

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12 },
  section: { marginBottom: 10 },
  header: { fontSize: 18, marginBottom: 20 },
  label: { fontWeight: 'bold' },
})

export function PayslipPdf({ slip, entry }: { slip: PayslipRow; entry: TimesheetRow }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Payslip</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Name: </Text>
          <Text>{entry.full_name}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Department: </Text>
          <Text>{entry.department}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Position: </Text>
          <Text>{entry.position}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Base Salary: </Text>
          <Text>{slip.base_salary}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Allowance: </Text>
          <Text>{slip.allowance}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Deductions: </Text>
          <Text>{slip.deductions}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Employee Social Insurance: </Text>
          <Text>{slip.employee_si}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Employer Social Insurance: </Text>
          <Text>{slip.employer_si}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Net Salary: </Text>
          <Text>{slip.net_salary}</Text>
        </View>
      </Page>
    </Document>
  )
}
