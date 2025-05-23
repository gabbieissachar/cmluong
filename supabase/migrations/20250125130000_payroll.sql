CREATE TABLE IF NOT EXISTS payroll_cycles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    month date NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'DRAFT'
);

CREATE TABLE IF NOT EXISTS timesheet_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id uuid REFERENCES payroll_cycles(id) ON DELETE CASCADE,
    user_id text NOT NULL,
    entry_date date NOT NULL,
    hours numeric,
    created_at timestamp with time zone DEFAULT now()
);
