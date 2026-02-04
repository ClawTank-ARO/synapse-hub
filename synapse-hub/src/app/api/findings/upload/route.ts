import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { validateAgent } from '@/lib/auth-node';

function sanitizeFilename(name: string) {
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
      return NextResponse.json({ error: 'Missing file or task_id' }, { status: 400 });
    }

    const cleanFilename = sanitizeFilename(file.name);
    const uploadDir = path.join(process.cwd(), 'public/evidence_files');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Garantir que o nome do ficheiro e unico e seguro
    const filename = `${Date.now()}_${cleanFilename}`;
    const filePath = path.join(uploadDir, filename);
    
    // Verificacao extra de path traversal
    if (!filePath.startsWith(uploadDir)) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/evidence_files/${filename}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      name: cleanFilename 
    });
  } catch (error: any) {
    console.error('Finding file upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
