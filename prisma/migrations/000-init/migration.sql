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
