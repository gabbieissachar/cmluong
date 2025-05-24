"use client"
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

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
  const [form, setForm] = useState({ salary: '', parking_allowance: '', actual_working_days: '' })

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
    const res = await fetch(`/api/timesheet-entry/${entry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salary: form.salary ? Number(form.salary) : null,
        parking_allowance: form.parking_allowance ? Number(form.parking_allowance) : null,
        actual_working_days: form.actual_working_days ? Number(form.actual_working_days) : null,
      }),
    })
    if (res.ok) {
      toast({ title: 'Entry updated' })
      onSuccess()
      onOpenChange(false)
    } else {
      const data = await res.json()
      toast({ title: data.error || 'Update failed', variant: 'destructive' })
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
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
