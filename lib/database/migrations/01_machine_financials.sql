-- Migration: Add machine financials support

-- Add documents column to machines
ALTER TABLE machines 
ADD COLUMN IF NOT EXISTS documents TEXT[];

-- Add machine_id to expenses
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS machine_id UUID REFERENCES machines(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_expenses_machine ON expenses(machine_id);

-- Update RLS policies (optional, but good practice if new columns need specific rules)
-- existing policies for 'machines' and 'expenses' should cover these new columns automatically 
-- as long as they are "FOR ALL" or "FOR SELECT".
