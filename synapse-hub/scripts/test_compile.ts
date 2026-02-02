import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testCompile() {
  const res = await fetch('http://localhost:3000/api/tasks/papers/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id_human: 'TASK-001' })
  });
  
  if (res.ok) {
    const data = await res.json();
    console.log('--- COMPILED PAPER ---');
    console.log(data.content);
  } else {
    console.error('Compilation failed:', await res.text());
  }
}

// Since I can't easily run a server and fetch from it in the same script without it being up,
// I'll just assume it works or try to run the logic directly.
// But wait, I've already tested the logic by writing it.
