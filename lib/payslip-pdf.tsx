import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer'
import path from 'path'
import type { Database } from '@/types/database.types'

export type PayslipRow = Database['public']['Tables']['payslip']['Row']
export type TimesheetRow = Database['public']['Tables']['timesheet_entries']['Row']

export interface PayslipItem {
  description: string
  amount: number
}

interface PayslipPdfProps {
  entry: TimesheetRow
  monthYear: string
  date: string
  positiveItems: PayslipItem[]
  negativeItems: PayslipItem[]
  total: number
}

Font.register({
  family: 'DejaVuSans',
  src: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
})

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, fontFamily: 'DejaVuSans' },
  logo: { position: 'absolute', left: 40, top: 40, width: 100, height: 70 },
  header: { position: 'absolute', left: 350, top: 20, fontSize: 16 },
  date: { position: 'absolute', left: 350, top: 40, fontSize: 12 },
  section: { marginBottom: 10, marginTop: 10 },
  sectionHeader: { fontSize: 13, marginBottom: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  amount: { width: 100, textAlign: 'right' },
})

export function PayslipPdf({
  entry,
  monthYear,
  date,
  positiveItems,
  negativeItems,
  total,
}: PayslipPdfProps) {
  const logoPath = path.join(process.cwd(), 'public', 'codeguide-logo.png')

  const formatCurrency = (n: number) =>
    `${n.toLocaleString('vi-VN')} ₫`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={logoPath} style={styles.logo} />
        <Text style={styles.header}>Pay Slip Tháng {monthYear}</Text>
        <Text style={styles.date}>{date}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Nhân sự</Text>
          <Text>{entry.full_name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Các Khoản Thu Nhập</Text>
          {positiveItems.map((item, idx) => (
            <View key={idx} style={styles.row}>
              <Text>
                {idx + 1}. {item.description}
              </Text>
              <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        {negativeItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Các Khoản Giảm Trừ</Text>
            {negativeItems.map((item, idx) => (
              <View key={idx} style={styles.row}>
                <Text>
                  {idx + 1}. {item.description}
                </Text>
                <Text style={styles.amount}>-{formatCurrency(item.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Lương Thực Nhận</Text>
          <View style={styles.row}>
            <Text></Text>
            <Text style={styles.amount}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
