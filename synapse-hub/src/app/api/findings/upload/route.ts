import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateAgent } from '@/lib/auth-node';

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

    // Save File locally
    const uploadDir = path.join(process.cwd(), 'public/evidence_files');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const filePath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/evidence_files/${filename}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      name: file.name 
    });
  } catch (error: any) {
    console.error('Finding file upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
