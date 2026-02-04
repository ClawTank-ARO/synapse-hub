import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { validateAgent } from '@/lib/auth-node';

function sanitizeFilename(name: string) {
  // Remove caminhos e caracteres especiais perigosos
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function POST(request: Request) {
  try {
    const auth = await validateAgent(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const task_id_human = formData.get('task_id_human') as string;
    
    if (!file || !task_id_human) {
      return NextResponse.json({ error: 'Missing file or task_id_human' }, { status: 400 });
    }

    const cleanFilename = sanitizeFilename(file.name);
    const name = (formData.get('name') as string || cleanFilename).replace('.pdf', '');

    // Get task UUID
    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id_human', task_id_human)
      .single();

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Save PDF a caminho seguro e fixo
    const uploadDir = path.join(process.cwd(), 'public/literature');
    const pdfPath = path.join(uploadDir, cleanFilename);
    const pdfBuffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(pdfPath, pdfBuffer);

    // OCR to TXT usando spawn (MUITO MAIS SEGURO que exec)
    const txtFilename = cleanFilename.replace('.pdf', '.txt');
    const txtPath = path.join(uploadDir, txtFilename);
    
    await new Promise((resolve, reject) => {
      // spawn passa os argumentos como um array, logo o shell nao os interpreta
      const ocr = spawn('pdftotext', ['-layout', pdfPath, txtPath]);
      ocr.on('close', (code) => {
        if (code === 0) resolve(true);
        else reject(new Error(`pdftotext failed with code ${code}`));
      });
      ocr.on('error', reject);
    });

    // Insert to DB
    const { data: dataset, error } = await supabase
      .from('datasets')
      .insert({
        task_id: task.id,
        name: `20260202_${name}_V01`,
        storage_url: `/literature/${cleanFilename}`,
        format: 'PDF/TXT',
        version: 1,
        status: 'raw',
        metadata: { 
          original_filename: file.name,
          txt_url: `/literature/${txtFilename}`
        }
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
