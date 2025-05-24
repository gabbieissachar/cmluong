"use client";

import { useState, useEffect, ReactNode, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from '@radix-ui/react-icons';
import Link from 'next/link'
import EditEntryDialog from '@/components/edit-entry-dialog'
import { Toaster } from '@/components/ui/sonner'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type Entry = {
  id: string
  cycle_id: string
  user_id: string
  full_name: string
  position: string
  total_leave_days: number | null
  bank_account_information: string
  department: string
  salary: number | null
  total_working_days_in_month: number | null
  paid_leave_days: number | null
  unpaid_leave_days: number | null
  actual_working_days: number | null
  parking_allowance: number | null
  employee_social_insurance_contribution: number | null
  salary_advance_deduction: number | null
  tuition_fee_deduction_for_children: number | null
  employer_social_insurance_contribution: number | null
  entry_date: string | null // Assuming date comes as string
  hours: number | null
  created_at: string // Assuming timestamp comes as string
  // Add Payslip related fields if needed, currently fetched separately
  net_salary?: number | null
  payslip_pdf?: string | null
}

const allColumns: { key: keyof Entry, label: string }[] = [
  { key: 'full_name', label: 'Name' },
  { key: 'position', label: 'Position' },
  { key: 'department', label: 'Department' },
  { key: 'salary', label: 'Salary' },
  { key: 'net_salary', label: 'Net Salary' },
  { key: 'total_working_days_in_month', label: 'Total Working Days' },
  { key: 'actual_working_days', label: 'Actual Working Days' },
  { key: 'total_leave_days', label: 'Total Leave Days' },
  { key: 'paid_leave_days', label: 'Paid Leave Days' },
  { key: 'unpaid_leave_days', label: 'Unpaid Leave Days' },
  { key: 'parking_allowance', label: 'Parking Allowance' },
  { key: 'employee_social_insurance_contribution', label: 'Employee SI' },
  { key: 'employer_social_insurance_contribution', label: 'Employer SI' },
  { key: 'salary_advance_deduction', label: 'Salary Advance Deduction' },
  { key: 'tuition_fee_deduction_for_children', label: 'Tuition Fee Deduction' },
  { key: 'bank_account_information', label: 'Bank Account' },
  { key: 'entry_date', label: 'Entry Date' },
  { key: 'hours', label: 'Hours' },
  { key: 'payslip_pdf', label: 'Payslip' },
  // Add other fields as needed
]

const LOCAL_STORAGE_KEY = 'payroll_cycle_visible_columns'

export default function CycleDetailPage({
  params,
}: { params: { month: string } }) {
  const { month } = params;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof Entry>>(
    new Set(allColumns.map((col) => col.key))
  );
  const [savedConfigs, setSavedConfigs] = useState<{ name: string; columns: (keyof Entry)[] }[]>([]);
  const [newConfigName, setNewConfigName] = useState('');
  const [editing, setEditing] = useState<Entry | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()
  const [generating, setGenerating] = useState<string | null>(null)
  const [bulkGenerating, setBulkGenerating] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      setSavedConfigs(JSON.parse(saved));
    }
  }, []);

  const handleColumnToggle = (columnKey: keyof Entry) => {
    setVisibleColumns((prev) => {
      const newVisibleColumns = new Set(prev);
      if (newVisibleColumns.has(columnKey)) {
        newVisibleColumns.delete(columnKey);
      } else {
        newVisibleColumns.add(columnKey);
      }
      return newVisibleColumns;
    });
  };

  const handleSelectAll = () => {
    setVisibleColumns(new Set(allColumns.map(col => col.key)));
  };

  const handleDeselectAll = () => {
    setVisibleColumns(new Set());
  };

  const handleSaveConfig = () => {
    if (newConfigName.trim() === '') return;
    const newConfig = { name: newConfigName, columns: Array.from(visibleColumns) };
    const updatedConfigs = [...savedConfigs, newConfig];
    setSavedConfigs(updatedConfigs);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedConfigs));
    setNewConfigName('');
  };

  const handleLoadConfig = (configName: string) => {
    const config = savedConfigs.find(cfg => cfg.name === configName);
    if (config) {
      setVisibleColumns(new Set(config.columns));
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(entries.map(e => e.id)));
    } else {
      setSelected(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const generatePayslip = async (entry: Entry) => {
    setGenerating(entry.id)
    try {
      const res = await fetch('/api/cycle/calculate-payslip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycleId: entry.cycle_id, userIds: [entry.user_id] }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Payslip generated' })
        fetchEntries()
      } else {
        toast({ title: data.error || 'Generation failed', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Generation failed', variant: 'destructive' })
    } finally {
      setGenerating(null)
    }
  }

  const generateBulkPayslips = async () => {
    if (selected.size === 0) return
    setBulkGenerating(true)
    const userIds = Array.from(selected).map(
      (id) => entries.find((e) => e.id === id)?.user_id
    ).filter(Boolean)
    try {
      const res = await fetch('/api/cycle/calculate-payslip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycleId: entries[0].cycle_id, userIds }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Payslips generated' })
        setSelected(new Set())
        fetchEntries()
      } else {
        toast({ title: data.error || 'Generation failed', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Generation failed', variant: 'destructive' })
    } finally {
      setBulkGenerating(false)
    }
  }

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/cycle/${month}/entries-with-payslip`)
      const data = await res.json()
      setEntries(data.entries)
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <nav className="w-full flex justify-between items-center p-4 border-b mb-6">
        <div className="text-lg font-bold">CM Salary Tool</div>
        <div className="flex gap-2">
          {/* TODO: Add logic to show Sign Out if signed in */}
          <Link href="/sign-up">
            <button className="px-4 py-2 bg-black text-white rounded">Sign Up</button>
          </Link>
          <Link href="/accountant/">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Accountant Cycle</button>
          </Link>
        </div>
      </nav>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Payroll Cycle Detail for {month}</h1>

        <div className="flex justify-between mb-4">
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.size === allColumns.length}
                  onCheckedChange={handleSelectAll}
                >
                  Select All
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.size === 0}
                  onCheckedChange={handleDeselectAll}
                >
                  Deselect All
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {allColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    className="capitalize"
                    checked={visibleColumns.has(column.key)}
                    onCheckedChange={() => handleColumnToggle(column.key)}
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center space-x-2">
              <Input
                placeholder="New config name"
                value={newConfigName}
                onChange={(e) => setNewConfigName(e.target.value)}
                className="w-[200px]"
              />
              <Button onClick={handleSaveConfig}>Save Config</Button>
            </div>

            {savedConfigs.length > 0 && (
              <Select onValueChange={handleLoadConfig}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Load Config" />
                </SelectTrigger>
                <SelectContent>
                  {savedConfigs.map(config => (
                    <SelectItem key={config.name} value={config.name}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={selected.size === entries.length && entries.length > 0}
                  onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                />
              </TableHead>
              {allColumns.map((column) =>
                visibleColumns.has(column.key) && (
                  <TableHead key={column.key}>{column.label}</TableHead>
                )
              )}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(entry.id)}
                    onCheckedChange={() => toggleSelect(entry.id)}
                  />
                </TableCell>
                {allColumns.map((column) =>
                  visibleColumns.has(column.key) && (
                    <TableCell key={column.key}>
                      {column.key === 'payslip_pdf' ? (
                        entry.payslip_pdf ? (
                          <a
                            href={entry.payslip_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Payslip
                          </a>
                        ) : (
                          'N/A'
                        )
                      ) : (
                        entry[column.key] as ReactNode
                      )}
                    </TableCell>
                  )
                )}
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(entry)
                        setDialogOpen(true)
                      }}
                    >
                      Edit Entry
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={generating === entry.id}
                      onClick={() => generatePayslip(entry)}
                    >
                      {generating === entry.id && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Generate Payslip
                    </Button>
                    {entry.payslip_pdf && (
                      <a
                        href={entry.payslip_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        PDF
                      </a>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {selected.size > 0 && (
          <div className="mt-4 p-4 bg-gray-100 rounded flex gap-2">
            <Button variant="secondary">Bulk Edit</Button>
            <Button onClick={generateBulkPayslips} disabled={bulkGenerating}>
              {bulkGenerating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate Payslip(s)
            </Button>
          </div>
        )}
      </div>
      <EditEntryDialog
        entry={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchEntries}
      />
      <Toaster />
    </>
  );
}