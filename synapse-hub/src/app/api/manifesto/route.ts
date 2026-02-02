import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Relative to workspace root
    const manifestoPath = path.join(process.cwd(), '../ClawTank/MANIFESTO.md');
    const content = fs.readFileSync(manifestoPath, 'utf8');
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Manifesto Load Error:', error);
    return NextResponse.json({ content: 'Manifesto unavailable.' }, { status: 500 });
  }
}
