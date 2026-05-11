import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

type ClientInfo = { name: string; color: string };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');

  let query = supabase
    .from('tasks')
    .select('*, clients(name, color)')
    .order('created_at', { ascending: false });

  if (clientId) query = query.eq('client_id', clientId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const tasks = (data ?? []).map(({ clients, ...task }) => ({
    ...task,
    client_name: (clients as ClientInfo).name,
    client_color: (clients as ClientInfo).color,
  }));

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const { client_id, title, description, status, priority, due_date } = await request.json();
  if (!client_id || !title?.trim()) {
    return NextResponse.json({ error: 'client_id and title are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      client_id,
      title: title.trim(),
      description: description || null,
      status: status || 'todo',
      priority: priority || 'medium',
      due_date: due_date || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
