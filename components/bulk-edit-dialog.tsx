"use client"
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Props {
  userIds: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  cycleId: string
  onSuccess: () => void
}

const fieldList = (process.env.NEXT_PUBLIC_BULK_EDIT_FIELDS || '')
  .split(',')
  .map(f => f.trim())
  .filter(Boolean)

export default function BulkEditDialog({
  userIds,
  open,
  onOpenChange,
  cycleId,
  onSuccess,
}: Props) {
  const { toast } = useToast()
  const [form, setForm] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userIds.length === 0) return
    setIsSubmitting(true)
    const updates: Record<string, any> = {}
    fieldList.forEach(f => {
      const val = form[f]
      if (val !== undefined && val !== '') {
        const num = Number(val)
        updates[f] = isNaN(num) ? val : num
      }
    })
    try {
      const res = await fetch('/api/timesheet-entry/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds, cycleId, updates }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Entries updated' })
        onSuccess()
        onOpenChange(false)
      } else {
        toast({ title: data.error || 'Update failed', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Update failed', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Edit Entries</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {fieldList.map(field => (
            <Input
              key={field}
              placeholder={field}
              value={form[field] || ''}
              onChange={e => updateField(field, e.target.value)}
            />
          ))}
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
