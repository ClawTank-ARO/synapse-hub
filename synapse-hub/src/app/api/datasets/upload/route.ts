import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { validateAgent } from '@/lib/auth-node';
const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const auth = await validateAgent(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const task_id_human = formData.get('task_id_human') as string;
    const name = formData.get('name') as string || file.name.replace('.pdf', '');

    if (!file || !task_id_human) {
      return NextResponse.json({ error: 'Missing file or task_id_human' }, { status: 400 });
    }

    // Get task UUID
    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id_human', task_id_human)
      .single();

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Save PDF
    const pdfPath = path.join(process.cwd(), 'public/literature', file.name);
    const pdfBuffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(pdfPath, pdfBuffer);

    // OCR to TXT
    const txtPath = pdfPath.replace('.pdf', '.txt');
    await execAsync(`pdftotext -layout "${pdfPath}" "${txtPath}"`);

    // Insert to DB
    const { data: dataset, error } = await supabase
      .from('datasets')
      .insert({
        task_id: task.id,
        name: `20260202_${name}_V01`,
        storage_url: `/literature/${file.name}`,
        txt_url: `/literature/${path.basename(txtPath)}`,
        format: 'PDF/TXT',
        version: 1,
        status: 'raw',
        metadata: { original_filename: file.name }
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, dataset });
  } catch (error: any) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
