"use client"
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import axios from 'axios'

export interface TimesheetEntry {
  id: string
  salary: number | null
  parking_allowance: number | null
  actual_working_days: number | null
}

interface Props {
  entry: TimesheetEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function EditEntryDialog({ entry, open, onOpenChange, onSuccess }: Props) {
  const { toast } = useToast()
  const [form, setForm] = useState({ salary: '', parking_allowance: '', actual_working_days: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (entry) {
      setForm({
        salary: entry.salary?.toString() || '',
        parking_allowance: entry.parking_allowance?.toString() || '',
        actual_working_days: entry.actual_working_days?.toString() || '',
      })
    }
  }, [entry])

  const updateField = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entry) return
    setIsSubmitting(true)
    try {
      const response = await axios.patch(`/api/timesheet-entry/${entry.id}`, {
        salary: form.salary ? Number(form.salary) : null,
        parking_allowance: form.parking_allowance ? Number(form.parking_allowance) : null,
        actual_working_days: form.actual_working_days ? Number(form.actual_working_days) : null,
      })
      toast({ title: 'Entry updated' })
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Update failed'
      toast({ title: errorMessage, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Input
            placeholder="Salary"
            value={form.salary}
            onChange={e => updateField('salary', e.target.value)}
          />
          <Input
            placeholder="Parking Allowance"
            value={form.parking_allowance}
            onChange={e => updateField('parking_allowance', e.target.value)}
          />
          <Input
            placeholder="Actual Working Days"
            value={form.actual_working_days}
            onChange={e => updateField('actual_working_days', e.target.value)}
          />
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
