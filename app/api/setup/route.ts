import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const SETUP_SQL = `
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'done')),
  priority VARCHAR(50) NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`.trim();

export async function POST() {
  const { error: clientsError } = await supabase.from('clients').select('id').limit(1);
  const { error: tasksError } = await supabase.from('tasks').select('id').limit(1);

  if (clientsError || tasksError) {
    return NextResponse.json({
      status: 'setup_required',
      message: 'Tables not found. Run the SQL below in your Supabase SQL editor (supabase.com → your project → SQL Editor).',
      sql: SETUP_SQL,
    });
  }

  return NextResponse.json({ status: 'ok', message: 'Database tables are ready.' });
}
