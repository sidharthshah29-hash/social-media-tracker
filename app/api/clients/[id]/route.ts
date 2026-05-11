import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { name, color } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('clients')
    .update({ name: name.trim(), color })
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
    .from('clients')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Deleted' });
}
