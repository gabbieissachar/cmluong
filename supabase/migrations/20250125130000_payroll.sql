CREATE TABLE IF NOT EXISTS payroll_cycles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    month date NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'DRAFT'
);

CREATE TABLE IF NOT EXISTS timesheet_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id uuid REFERENCES payroll_cycles(id) ON DELETE CASCADE,
    user_id text NOT NULL,
    full_name text NOT NULL,
    position text NOT NULL,
    total_leave_days numeric,
    bank_account_information text NOT NULL,
    department text NOT NULL,
    salary numeric,
    total_working_days_in_month numeric,
    paid_leave_days numeric,
    unpaid_leave_days numeric,
    actual_working_days numeric,
    parking_allowance numeric,
    employee_social_insurance_contribution numeric,
    salary_advance_deduction numeric,
    tuition_fee_deduction_for_children numeric,
    employer_social_insurance_contribution numeric,
    entry_date date,
    hours numeric,
    created_at timestamp with time zone DEFAULT now()
);

-- Initial migration generated manually
CREATE TYPE "Role" AS ENUM ('LEADER', 'ACCOUNTANT', 'STAFF');
CREATE TYPE "CycleStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PAID');

CREATE TABLE "User" (
  "id" text PRIMARY KEY,
  "email" text NOT NULL UNIQUE,
  "role" "Role" NOT NULL,
  "fullName" text NOT NULL,
  "bankAccount" text
);

CREATE TABLE "PayrollCycle" (
  "id" text PRIMARY KEY,
  "month" timestamp(3) NOT NULL,
  "status" "CycleStatus" NOT NULL,
  "advanceAt" timestamp(3)
);

CREATE TABLE "Payslip" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL,
  "cycleId" text NOT NULL,
  "baseSalary" integer NOT NULL,
  "allowance" integer NOT NULL,
  "deductions" integer NOT NULL,
  "employeeSI" integer NOT NULL,
  "employerSI" integer NOT NULL,
  "netSalary" integer NOT NULL,
  "pdfPath" text,
  "confirmedByUser" boolean NOT NULL DEFAULT false,
  CONSTRAINT "Payslip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Payslip_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "PayrollCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
