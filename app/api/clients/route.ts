import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await supabase
    .from('clients')
    .select('*, tasks(status)')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const clients = (data ?? []).map(({ tasks, ...client }) => ({
    ...client,
    todo_count: tasks.filter((t: { status: string }) => t.status === 'todo').length,
    in_progress_count: tasks.filter((t: { status: string }) => t.status === 'in_progress').length,
    done_count: tasks.filter((t: { status: string }) => t.status === 'done').length,
  }));

  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  const { name, color, is_potential } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({ name: name.trim(), color: color || '#6366f1', is_potential: is_potential ?? false })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
