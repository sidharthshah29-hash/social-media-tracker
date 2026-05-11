import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

type ClientInfo = { name: string; color: string };

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, clients(name, color)')
    .eq('id', params.id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { clients, ...task } = data;
  return NextResponse.json({
    ...task,
    client_name: (clients as ClientInfo).name,
    client_color: (clients as ClientInfo).color,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { title, description, status, priority, due_date } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({
      title: title.trim(),
      description: description || null,
      status,
      priority,
      due_date: due_date || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Deleted' });
}
